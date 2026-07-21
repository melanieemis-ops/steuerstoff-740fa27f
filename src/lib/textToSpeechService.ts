import { buildSpeechCacheSignature } from "@/lib/prepareTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, getVoiceProfile } from "@/lib/ttsVoiceProfiles";

const cache = new Map<string, string>();

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
    const message = await response.text().catch(() => "");
    throw new Error(message || "Die Sprachausgabe konnte gerade nicht geladen werden.");
  }

  return response.blob();
}

export function clearSpeechAudioCache(): void {
  revokeCachedUrls();
}
