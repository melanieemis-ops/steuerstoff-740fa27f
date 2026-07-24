/**
 * Persistenz für Vorlese-Einstellungen im lokalen Browser-Speicher.
 */

const STORAGE_KEY = "steuerstoff-speech-settings-v1";
const RATE_KEY = "steuerstoff_tts_rate_v1";
const VOICE_KEY = "steuerstoff_tts_voice_v1";
const PROFILE_KEY = "steuerstoff_tts_profile_v1";
const FALLBACK_KEY = "steuerstoff_tts_browser_fallback_v1";
const PROVIDER_KEY = "steuerstoff_tts_provider_v1";
const OPENAI_VOICE_KEY = "steuerstoff_tts_openai_voice_v1";

export type TtsProvider = "openai" | "elevenlabs";
export type OpenAiVoice = "coral" | "marin" | "nova" | "shimmer";

export type SpeechSettings = {
  rate: number;
  voiceURI?: string;
  profileId?: string;
  allowBrowserFallback?: boolean;
  provider?: TtsProvider;
  openAiVoice?: OpenAiVoice;
};

const DEFAULTS: Required<Pick<SpeechSettings, "rate" | "profileId" | "allowBrowserFallback" | "provider" | "openAiVoice">> = {
  rate: 1,
  profileId: "steuerstoff-ki-stimme",
  allowBrowserFallback: true,
  provider: "openai",
  openAiVoice: "coral",
};

function cleanOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function cleanProvider(value: unknown): TtsProvider {
  return value === "elevenlabs" ? "elevenlabs" : "openai";
}

function cleanOpenAiVoice(value: unknown): OpenAiVoice {
  return value === "marin" || value === "nova" || value === "shimmer" ? value : "coral";
}

export function loadSpeechSettings(): SpeechSettings {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const rawRate = window.localStorage.getItem(RATE_KEY);
    const rawVoice = window.localStorage.getItem(VOICE_KEY);
    const rawProfile = window.localStorage.getItem(PROFILE_KEY);
    const rawFallback = window.localStorage.getItem(FALLBACK_KEY);
    const rawProvider = window.localStorage.getItem(PROVIDER_KEY);
    const rawOpenAiVoice = window.localStorage.getItem(OPENAI_VOICE_KEY);
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
      provider: cleanProvider(rawProvider ?? parsed.provider),
      openAiVoice: cleanOpenAiVoice(rawOpenAiVoice ?? parsed.openAiVoice),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSpeechSettings(settings: SpeechSettings): void {
  if (typeof window === "undefined") return;
  try {
    const normalized: SpeechSettings = {
      ...settings,
      provider: cleanProvider(settings.provider),
      openAiVoice: cleanOpenAiVoice(settings.openAiVoice),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.localStorage.setItem(RATE_KEY, String(normalized.rate));
    window.localStorage.setItem(PROFILE_KEY, normalized.profileId ?? DEFAULTS.profileId);
    window.localStorage.setItem(FALLBACK_KEY, normalized.allowBrowserFallback === false ? "0" : "1");
    window.localStorage.setItem(PROVIDER_KEY, normalized.provider ?? DEFAULTS.provider);
    window.localStorage.setItem(OPENAI_VOICE_KEY, normalized.openAiVoice ?? DEFAULTS.openAiVoice);
    if (normalized.voiceURI) {
      window.localStorage.setItem(VOICE_KEY, normalized.voiceURI);
    } else {
      window.localStorage.removeItem(VOICE_KEY);
    }
    window.dispatchEvent(new Event("steuerstoff:speech-settings"));
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
    PROVIDER_KEY,
    OPENAI_VOICE_KEY,
  ]) {
    window.localStorage.removeItem(key);
  }
}
