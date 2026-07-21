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
  profileId: "melanie-lernstimme",
  allowBrowserFallback: false,
};

export function loadSpeechSettings(): SpeechSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const rawRate = window.localStorage.getItem(RATE_KEY);
    const rawVoice = window.localStorage.getItem(VOICE_KEY);
    const rawProfile = window.localStorage.getItem(PROFILE_KEY);
    const rawFallback = window.localStorage.getItem(FALLBACK_KEY);
    const rawVoiceOverride = window.localStorage.getItem(VOICE_OVERRIDE_KEY);
    const rawApiKey = window.localStorage.getItem(API_KEY_KEY);

    if (
      rawRate !== null ||
      rawVoice !== null ||
      rawProfile !== null ||
      rawFallback !== null ||
      rawVoiceOverride !== null ||
      rawApiKey !== null
    ) {
      const parsedRate = rawRate === null ? undefined : Number(rawRate);
      return {
        rate:
          typeof parsedRate === "number" &&
          Number.isFinite(parsedRate) &&
          parsedRate >= 0.1 &&
          parsedRate <= 10
            ? parsedRate
            : DEFAULTS.rate,
        voiceURI: rawVoice && rawVoice.trim().length > 0 ? rawVoice : undefined,
        profileId: rawProfile && rawProfile.trim().length > 0 ? rawProfile : DEFAULTS.profileId,
        voiceIdOverride:
          rawVoiceOverride && rawVoiceOverride.trim().length > 0 ? rawVoiceOverride : undefined,
        apiKey: rawApiKey && rawApiKey.trim().length > 0 ? rawApiKey : undefined,
        allowBrowserFallback: rawFallback === "1",
      };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<SpeechSettings>;
    return {
      rate:
        typeof parsed.rate === "number" && parsed.rate >= 0.1 && parsed.rate <= 10
          ? parsed.rate
          : DEFAULTS.rate,
      voiceURI: typeof parsed.voiceURI === "string" ? parsed.voiceURI : undefined,
      profileId:
        typeof parsed.profileId === "string" && parsed.profileId.trim().length > 0
          ? parsed.profileId
          : DEFAULTS.profileId,
      voiceIdOverride:
        typeof parsed.voiceIdOverride === "string" && parsed.voiceIdOverride.trim().length > 0
          ? parsed.voiceIdOverride
          : undefined,
      apiKey:
        typeof parsed.apiKey === "string" && parsed.apiKey.trim().length > 0
          ? parsed.apiKey
          : undefined,
      allowBrowserFallback:
        typeof parsed.allowBrowserFallback === "boolean"
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
