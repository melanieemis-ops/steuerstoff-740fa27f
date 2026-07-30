import { buildSpeechCacheSignature } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";
import { apiUrl } from "@/lib/api";
import { getTtsAccessCode } from "@/lib/ttsAccessCodeStorage";
import { loadSpeechSettings, type OpenAiVoice, type TtsProvider } from "@/lib/speech-storage";

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
  | "OPENAI_ERROR"
  | "GEMINI_ERROR"
  | "REQUEST_INVALID"
  | "TEXT_TOO_LONG"
  | "UNKNOWN_ERROR";

export const TTS_MISSING_ACCESS_CODE_MESSAGE =
  "Für die Vorlesefunktion benötigst du den Freischaltcode aus den Einstellungen.";
export const TTS_INVALID_ACCESS_CODE_MESSAGE =
  "Der Freischaltcode für die Vorlesefunktion ist ungültig oder nicht mehr gültig.";
export const TTS_RATE_LIMIT_MESSAGE =
  "Die Vorlesefunktion wird gerade sehr häufig verwendet. Bitte versuche es in Kürze erneut.";
export const TTS_GENERIC_ERROR_MESSAGE =
  "Die Audiodatei konnte gerade nicht erstellt werden. Bitte versuche es erneut oder nutze die Browserstimme.";

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
    try { URL.revokeObjectURL(url); } catch { /* ignore */ }
  }
  cache.clear();
}
if (typeof window !== "undefined") window.addEventListener("pagehide", revokeCachedUrls);

export type TtsRequestPayload = {
  text: string;
  provider?: TtsProvider;
  voice?: OpenAiVoice;
  modelId?: string;
  profileId?: string;
};

export function getAudioCacheKey(payload: TtsRequestPayload): string {
  const settings = loadSpeechSettings();
  const provider = payload.provider ?? settings.provider ?? "openai";
  const voice = payload.voice ?? settings.openAiVoice ?? "coral";
  return buildSpeechCacheSignature({
    text: payload.text,
    voiceId: `${provider}:${voice}`,
    modelId: payload.modelId ?? DEFAULT_TTS_MODEL_ID,
    profileId: payload.profileId ?? getVoiceProfile().id,
  });
}
export function getCachedAudioUrl(cacheKey: string): string | undefined { return cache.get(cacheKey); }
export function storeCachedAudioUrl(cacheKey: string, url: string): void { cache.set(cacheKey, url); }

export async function requestSpeechAudio(payload: TtsRequestPayload, signal: AbortSignal): Promise<Blob> {
  const settings = loadSpeechSettings();
  const provider = payload.provider ?? settings.provider ?? "openai";
  const voice = payload.voice ?? settings.openAiVoice ?? "coral";
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  const accessCode = await getTtsAccessCode();
  if (accessCode) headers["x-tts-access-code"] = accessCode;

  const response = await fetch(apiUrl("/api/text-to-speech"), {
    method: "POST",
    headers,
    body: JSON.stringify({ ...payload, provider, voice }),
    signal,
  });

  if (!response.ok) {
    let code: TtsApiErrorCode = "UNKNOWN_ERROR";
    let backendMessage = "";
    try {
      const errorPayload = (await response.json()) as { error?: unknown; message?: unknown };
      if (typeof errorPayload.error === "string") code = errorPayload.error as TtsApiErrorCode;
      if (typeof errorPayload.message === "string") backendMessage = errorPayload.message.trim();
    } catch { /* ignore */ }

    if (process.env.NODE_ENV === "development") {
      console.warn(`[${FUNCTION_NAME}] status=${response.status} code=${code} message=${backendMessage}`);
    }

    if (response.status === 401 || code === "INVALID_TTS_ACCESS_CODE") {
      throw new TtsApiError("INVALID_TTS_ACCESS_CODE", backendMessage || TTS_INVALID_ACCESS_CODE_MESSAGE, response.status);
    }
    if (code === "MISSING_TTS_ACCESS_CODE") {
      throw new TtsApiError("MISSING_TTS_ACCESS_CODE", backendMessage || TTS_MISSING_ACCESS_CODE_MESSAGE, response.status);
    }
    if (response.status === 429) {
      throw new TtsApiError("RATE_LIMITED", backendMessage || TTS_RATE_LIMIT_MESSAGE, response.status);
    }
    throw new TtsApiError(code, backendMessage || TTS_GENERIC_ERROR_MESSAGE, response.status);
  }

  const blob = await response.blob();
  if (!blob.size) throw new TtsApiError("UNKNOWN_ERROR", TTS_GENERIC_ERROR_MESSAGE, 502);
  return blob;
}

export async function requestElevenLabsAudio(payload: TtsRequestPayload, signal: AbortSignal) {
  return requestSpeechAudio(payload, signal);
}
export async function requestOpenAiAudio(payload: TtsRequestPayload, signal: AbortSignal) {
  return requestSpeechAudio({ ...payload, provider: "openai" }, signal);
}

export function isTtsAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
export function ttsErrorMessage(error: unknown): string {
  if (error instanceof TtsApiError) return error.message;
  return TTS_GENERIC_ERROR_MESSAGE;
}
export function ttsErrorNeedsSettings(error: unknown): boolean {
  return error instanceof TtsApiError &&
    (error.code === "MISSING_TTS_ACCESS_CODE" || error.code === "INVALID_TTS_ACCESS_CODE");
}
export function clearSpeechAudioCache(): void { revokeCachedUrls(); }
