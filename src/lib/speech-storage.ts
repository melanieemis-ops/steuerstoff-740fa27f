/**
 * speech-storage.ts
 * Persistenz für Vorlese-Einstellungen im lokalen Browser-Speicher.
 */

const STORAGE_KEY = "steuerstoff-speech-settings-v1";
const RATE_KEY = "steuerstoff_tts_rate_v1";
const VOICE_KEY = "steuerstoff_tts_voice_v1";
const PROFILE_KEY = "steuerstoff_tts_profile_v1";
const FALLBACK_KEY = "steuerstoff_tts_browser_fallback_v1";
const VOICE_OVERRIDE_KEY = "steuerstoff_tts_voice_override_v1";
const API_KEY_KEY = "steuerstoff_tts_api_key_v1";

const LEGACY_API_KEY_KEYS = [
  "elevenlabsApiKey",
  "ELEVENLABS_API_KEY",
  "ttsApiKey",
  "speechApiKey",
] as const;

const LEGACY_VOICE_ID_KEYS = [
  "elevenlabsVoiceId",
  "ELEVENLABS_VOICE_ID",
  "ttsVoiceId",
  "speechVoiceId",
] as const;

export type SpeechSettings = {
  rate: number;
  voiceURI?: string;
  profileId?: string;
  voiceIdOverride?: string;
  apiKey?: string;
  allowBrowserFallback?: boolean;
};

const DEFAULTS: SpeechSettings = {
  rate: 1.0,
  profileId: "steuerstoff-ki-stimme",
  allowBrowserFallback: false,
};

function cleanOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readFirstStorageValue(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = cleanOptionalString(window.localStorage.getItem(key));
    if (value) return value;
  }
  return undefined;
}

export function loadSpeechSettings(): SpeechSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const rawRate = window.localStorage.getItem(RATE_KEY);
    const rawVoice = window.localStorage.getItem(VOICE_KEY);
    const rawProfile = window.localStorage.getItem(PROFILE_KEY);
    const rawFallback = window.localStorage.getItem(FALLBACK_KEY);
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as Partial<SpeechSettings> & Record<string, unknown>)
      : ({} as Partial<SpeechSettings> & Record<string, unknown>);
    const parsedRate = rawRate === null ? parsed.rate : Number(rawRate);

    return {
      rate:
        typeof parsedRate === "number" &&
        Number.isFinite(parsedRate) &&
        parsedRate >= 0.1 &&
        parsedRate <= 10
          ? parsedRate
          : DEFAULTS.rate,
      voiceURI: cleanOptionalString(rawVoice) ?? cleanOptionalString(parsed.voiceURI),
      profileId:
        cleanOptionalString(rawProfile) ??
        cleanOptionalString(parsed.profileId) ??
        DEFAULTS.profileId,
      voiceIdOverride:
        cleanOptionalString(window.localStorage.getItem(VOICE_OVERRIDE_KEY)) ??
        cleanOptionalString(parsed.voiceIdOverride) ??
        cleanOptionalString(parsed.voiceId) ??
        cleanOptionalString(parsed.elevenlabsVoiceId) ??
        readFirstStorageValue(LEGACY_VOICE_ID_KEYS),
      apiKey:
        cleanOptionalString(window.localStorage.getItem(API_KEY_KEY)) ??
        cleanOptionalString(parsed.apiKey) ??
        cleanOptionalString(parsed.elevenlabsApiKey) ??
        readFirstStorageValue(LEGACY_API_KEY_KEYS),
      allowBrowserFallback:
        rawFallback !== null
          ? rawFallback === "1"
          : typeof parsed.allowBrowserFallback === "boolean"
            ? parsed.allowBrowserFallback
            : DEFAULTS.allowBrowserFallback,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSpeechSettings(settings: SpeechSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.localStorage.setItem(RATE_KEY, String(settings.rate));
    window.localStorage.setItem(PROFILE_KEY, settings.profileId ?? DEFAULTS.profileId ?? "");
    window.localStorage.setItem(FALLBACK_KEY, settings.allowBrowserFallback ? "1" : "0");
    if (settings.voiceURI) {
      window.localStorage.setItem(VOICE_KEY, settings.voiceURI);
    } else {
      window.localStorage.removeItem(VOICE_KEY);
    }
    if (settings.voiceIdOverride) {
      window.localStorage.setItem(VOICE_OVERRIDE_KEY, settings.voiceIdOverride);
    } else {
      window.localStorage.removeItem(VOICE_OVERRIDE_KEY);
    }
    if (settings.apiKey) {
      window.localStorage.setItem(API_KEY_KEY, settings.apiKey);
    } else {
      window.localStorage.removeItem(API_KEY_KEY);
    }
  } catch {
    // Quota / privacy mode ignorieren.
  }
}

export function clearSpeechSettings(): void {
  if (typeof window === "undefined") return;
  for (const key of [
    STORAGE_KEY,
    RATE_KEY,
    VOICE_KEY,
    PROFILE_KEY,
    FALLBACK_KEY,
    VOICE_OVERRIDE_KEY,
    API_KEY_KEY,
    ...LEGACY_API_KEY_KEYS,
    ...LEGACY_VOICE_ID_KEYS,
  ]) {
    window.localStorage.removeItem(key);
  }
}
