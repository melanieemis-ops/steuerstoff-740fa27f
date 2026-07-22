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

const LEGACY_KEYS = [
  "elevenlabsApiKey",
  "elevenlabsVoiceId",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "ttsApiKey",
  "ttsVoiceId",
  "speechApiKey",
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

export function loadSpeechSettings(): SpeechSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    // Alte TTS-Konfigurationen entfernen: Key/Voice werden serverseitig festgelegt.
    for (const key of LEGACY_KEYS) {
      window.localStorage.removeItem(key);
    }

    window.localStorage.removeItem(API_KEY_KEY);
    window.localStorage.removeItem(VOICE_OVERRIDE_KEY);

    const rawRate = window.localStorage.getItem(RATE_KEY);
    const rawVoice = window.localStorage.getItem(VOICE_KEY);
    const rawProfile = window.localStorage.getItem(PROFILE_KEY);
    const rawFallback = window.localStorage.getItem(FALLBACK_KEY);

    if (rawRate !== null || rawVoice !== null || rawProfile !== null || rawFallback !== null) {
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
        allowBrowserFallback: rawFallback === "1",
      };
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };

    const parsed = JSON.parse(raw) as Partial<SpeechSettings> & Record<string, unknown>;
    const sanitized: SpeechSettings = {
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
      allowBrowserFallback:
        typeof parsed.allowBrowserFallback === "boolean"
          ? parsed.allowBrowserFallback
          : DEFAULTS.allowBrowserFallback,
    };

    // Falls frühere Versionen API-/Voice-IDs unter demselben Key gespeichert haben,
    // wird der Eintrag auf das neue, reduzierte Format zurückgeschrieben.
    const hasLegacyFields =
      "apiKey" in parsed ||
      "voiceId" in parsed ||
      "elevenlabsApiKey" in parsed ||
      "elevenlabsVoiceId" in parsed;
    if (hasLegacyFields) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    }

    sanitized.apiKey = undefined;
    sanitized.voiceIdOverride = undefined;

    return sanitized;
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
    window.localStorage.removeItem(API_KEY_KEY);
  } catch {
    // Quota / privacy mode ignorieren.
  }
}
