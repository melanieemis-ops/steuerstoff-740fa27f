/**
 * speech-storage.ts
 * Persistenz für Vorlese-Einstellungen im lokalen Browser-Speicher.
 */

const STORAGE_KEY = "steuerstoff-speech-settings-v1";
const RATE_KEY = "steuerstoff_tts_rate_v1";
const VOICE_KEY = "steuerstoff_tts_voice_v1";
const PROFILE_KEY = "steuerstoff_tts_profile_v1";
const FALLBACK_KEY = "steuerstoff_tts_browser_fallback_v1";

export type SpeechSettings = {
  rate: number;
  voiceURI?: string;
  profileId?: string;
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
  } catch {
    // Quota / privacy mode ignorieren.
  }
}

export function clearSpeechSettings(): void {
  if (typeof window === "undefined") return;
  for (const key of [STORAGE_KEY, RATE_KEY, VOICE_KEY, PROFILE_KEY, FALLBACK_KEY]) {
    window.localStorage.removeItem(key);
  }
}
