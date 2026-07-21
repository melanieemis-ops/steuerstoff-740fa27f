/**
 * speech-storage.ts
 * Persistenz für Vorlese-Einstellungen im lokalen Browser-Speicher.
 */

const STORAGE_KEY = "steuerstoff-speech-settings-v1";
const RATE_KEY = "steuerstoff_tts_rate_v1";
const VOICE_KEY = "steuerstoff_tts_voice_v1";

export type SpeechSettings = {
  rate: number;
  voiceURI?: string;
};

const DEFAULTS: SpeechSettings = {
  rate: 1.0,
};

export function loadSpeechSettings(): SpeechSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const rawRate = window.localStorage.getItem(RATE_KEY);
    const rawVoice = window.localStorage.getItem(VOICE_KEY);

    if (rawRate !== null || rawVoice !== null) {
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
    if (settings.voiceURI) {
      window.localStorage.setItem(VOICE_KEY, settings.voiceURI);
    } else {
      window.localStorage.removeItem(VOICE_KEY);
    }
  } catch {
    // Quota / privacy mode ignorieren.
  }
}
