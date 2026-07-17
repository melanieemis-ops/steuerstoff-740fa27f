/**
 * speech-storage.ts
 * Persistenz für Vorlese-Einstellungen im lokalen Browser-Speicher.
 */

const STORAGE_KEY = "steuerstoff-speech-settings-v1";

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
  } catch {
    // Quota / privacy mode ignorieren.
  }
}
