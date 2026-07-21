import { buildSpeechCacheSignature } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

export const ELEVENLABS_VOICE_ID = "g1jpii0iyvtRs8fqXsd1";

const cache = new Map<string, string>();
const FUNCTION_NAME = "api/text-to-speech";

export type TtsApiErrorCode =
  | "CONFIGURATION_ERROR"
  | "INVALID_API_KEY"
  | "VOICE_NOT_AVAILABLE"
  | "VOICE_NOT_FOUND"
  | "QUOTA_EXCEEDED"
  | "ELEVENLABS_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG"
  | "UNKNOWN_ERROR";

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
  voiceId?: string;
  modelId?: string;
  profileId?: string;
  apiKey?: string;
};

export function getAudioCacheKey(payload: TtsRequestPayload): string {
  return buildSpeechCacheSignature({
    text: payload.text,
    voiceId: payload.voiceId ?? "default",
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
  const response = await fetch("/api/text-to-speech", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let code: TtsApiErrorCode = "UNKNOWN_ERROR";
    let message = "Die Sprachausgabe konnte gerade nicht geladen werden.";

    try {
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.toLowerCase().includes("application/json")) {
        const payload = (await response.json()) as { error?: unknown; message?: unknown };
        if (typeof payload.error === "string") {
          code = payload.error as TtsApiErrorCode;
        }
        if (typeof payload.message === "string" && payload.message.trim()) {
          message = payload.message;
        }
      } else {
        const text = await response.text();
        if (text.trim()) message = text;
      }
    } catch {
      // ignore parsing errors
    }

    if (process.env.NODE_ENV === "development") {
      // Keep diagnostics terse and sanitized.
      console.warn(`[${FUNCTION_NAME}] status=${response.status} code=${code}`);
    }

    throw new TtsApiError(code, message, response.status);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new TtsApiError(
      "ELEVENLABS_ERROR",
      "Die Sprachausgabe konnte gerade nicht geladen werden.",
      502,
    );
  }

  return blob;
}

export function clearSpeechAudioCache(): void {
  revokeCachedUrls();
}
