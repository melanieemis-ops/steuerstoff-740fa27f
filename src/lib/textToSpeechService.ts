import { buildSpeechCacheSignature } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";
import { apiUrl } from "@/lib/api";
import { getTtsAccessCode } from "@/lib/ttsAccessCodeStorage";

const cache = new Map<string, string>();
const FUNCTION_NAME = "api/text-to-speech";

export type TtsApiErrorCode =
  | "CONFIGURATION_ERROR"
  | "MISSING_TTS_ACCESS_CODE"
  | "INVALID_TTS_ACCESS_CODE"
  | "RATE_LIMITED"
  | "VOICE_NOT_AVAILABLE"
  | "VOICE_NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "ELEVENLABS_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG"
  | "UNKNOWN_ERROR";

export const TTS_MISSING_ACCESS_CODE_MESSAGE =
  "Für die Vorlesefunktion benötigst du einen Freischaltcode. Du kannst ihn über Instagram bei @steuerstoff anfragen und anschließend in den Einstellungen eintragen.";

export const TTS_INVALID_ACCESS_CODE_MESSAGE =
  "Der Freischaltcode ist ungültig oder nicht mehr gültig. Bitte prüfe den Code in den Einstellungen oder frage bei @steuerstoff einen neuen Zugang an.";

export const TTS_RATE_LIMIT_MESSAGE =
  "Die Vorlesefunktion wird gerade sehr häufig verwendet. Bitte versuche es in Kürze erneut.";

export const TTS_GENERIC_ERROR_MESSAGE =
  "Die Audiodatei konnte gerade nicht erstellt werden. Bitte versuche es erneut.";

export class TtsApiError extends Error {
  code: TtsApiErrorCode;
  status: number;

  constructor(code: TtsApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "TtsApiError";
    this.code = code;
    this.status = status;
  }
}

function revokeCachedUrls() {
  for (const url of cache.values()) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }
  cache.clear();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", revokeCachedUrls);
}

export type TtsRequestPayload = {
  text: string;
  modelId?: string;
  profileId?: string;
};

export function getAudioCacheKey(payload: TtsRequestPayload): string {
  return buildSpeechCacheSignature({
    text: payload.text,
    voiceId: "server-default",
    modelId: payload.modelId ?? DEFAULT_TTS_MODEL_ID,
    profileId: payload.profileId ?? getVoiceProfile().id,
  });
}

export function getCachedAudioUrl(cacheKey: string): string | undefined {
  return cache.get(cacheKey);
}

export function storeCachedAudioUrl(cacheKey: string, url: string): void {
  cache.set(cacheKey, url);
}

export async function requestElevenLabsAudio(
  payload: TtsRequestPayload,
  signal: AbortSignal,
): Promise<Blob> {
  const accessCode = await getTtsAccessCode();
  if (!accessCode) {
    throw new TtsApiError("MISSING_TTS_ACCESS_CODE", TTS_MISSING_ACCESS_CODE_MESSAGE, 0);
  }

  const response = await fetch(apiUrl("/api/text-to-speech"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-code": accessCode,
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let code: TtsApiErrorCode = "UNKNOWN_ERROR";

    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.toLowerCase().includes("application/json")) {
        const errorPayload = (await response.json()) as { error?: unknown };
        if (typeof errorPayload.error === "string") {
          code = errorPayload.error as TtsApiErrorCode;
        }
      }
    } catch {
      // ignore parsing errors
    }

    if (process.env.NODE_ENV === "development") {
      // Keep diagnostics terse and sanitized.
      console.warn(`[${FUNCTION_NAME}] status=${response.status} code=${code}`);
    }

    if (response.status === 401 || code === "INVALID_TTS_ACCESS_CODE") {
      throw new TtsApiError(
        "INVALID_TTS_ACCESS_CODE",
        TTS_INVALID_ACCESS_CODE_MESSAGE,
        response.status,
      );
    }

    if (response.status === 429) {
      throw new TtsApiError("RATE_LIMITED", TTS_RATE_LIMIT_MESSAGE, response.status);
    }

    throw new TtsApiError(code, TTS_GENERIC_ERROR_MESSAGE, response.status);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new TtsApiError("ELEVENLABS_ERROR", TTS_GENERIC_ERROR_MESSAGE, 502);
  }

  return blob;
}

export function isTtsAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function ttsErrorMessage(error: unknown): string {
  if (error instanceof TtsApiError) return error.message;
  return TTS_GENERIC_ERROR_MESSAGE;
}

export function ttsErrorNeedsSettings(error: unknown): boolean {
  return (
    error instanceof TtsApiError &&
    (error.code === "MISSING_TTS_ACCESS_CODE" || error.code === "INVALID_TTS_ACCESS_CODE")
  );
}

export function clearSpeechAudioCache(): void {
  revokeCachedUrls();
}
