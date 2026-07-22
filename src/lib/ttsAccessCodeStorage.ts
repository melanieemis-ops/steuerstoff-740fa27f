import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

const TTS_ACCESS_CODE_KEY = "steuerstoff_tts_access_code_v1";
const SPEECH_SETTINGS_KEY = "steuerstoff-speech-settings-v1";

const LEGACY_ELEVENLABS_KEYS = [
  "steuerstoff_tts_api_key_v1",
  "steuerstoff_tts_voice_override_v1",
  "elevenlabsApiKey",
  "elevenlabs_api_key",
  "ELEVENLABS_API_KEY",
  "ttsApiKey",
  "speechApiKey",
  "elevenlabsVoiceId",
  "elevenlabs_voice_id",
  "ELEVENLABS_VOICE_ID",
  "ttsVoiceId",
  "speechVoiceId",
] as const;

const LEGACY_SPEECH_SETTING_FIELDS = [
  "apiKey",
  "elevenlabsApiKey",
  "elevenlabs_api_key",
  "voiceIdOverride",
  "voiceId",
  "elevenlabsVoiceId",
  "elevenlabs_voice_id",
] as const;

function cleanCode(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Private mode or blocked storage: nothing else to remove.
  }
}

function removeLegacyFields(raw: string | null): string | null {
  if (!raw) return raw;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") return raw;

    let changed = false;
    for (const field of LEGACY_SPEECH_SETTING_FIELDS) {
      if (field in parsed) {
        delete parsed[field];
        changed = true;
      }
    }

    return changed ? JSON.stringify(parsed) : raw;
  } catch {
    return raw;
  }
}

async function cleanNativeLegacyStorage(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    await Promise.all(LEGACY_ELEVENLABS_KEYS.map((key) => Preferences.remove({ key })));

    const storedSettings = await Preferences.get({ key: SPEECH_SETTINGS_KEY });
    const cleanedSettings = removeLegacyFields(storedSettings.value);
    if (cleanedSettings !== storedSettings.value && cleanedSettings !== null) {
      await Preferences.set({ key: SPEECH_SETTINGS_KEY, value: cleanedSettings });
    }
  } catch {
    // Older native builds may not have the Preferences plugin registered yet.
  }
}

export async function removeLegacyClientElevenLabsCredentials(): Promise<void> {
  if (typeof window === "undefined") return;

  for (const key of LEGACY_ELEVENLABS_KEYS) {
    removeFromLocalStorage(key);
  }

  const storedSettings = readLocalStorage(SPEECH_SETTINGS_KEY);
  const cleanedSettings = removeLegacyFields(storedSettings);
  if (cleanedSettings !== storedSettings && cleanedSettings !== null) {
    writeLocalStorage(SPEECH_SETTINGS_KEY, cleanedSettings);
  }

  await cleanNativeLegacyStorage();
}

export async function getTtsAccessCode(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  await removeLegacyClientElevenLabsCredentials();

  let canUseNativePreferences = false;
  if (Capacitor.isNativePlatform()) {
    try {
      const stored = await Preferences.get({ key: TTS_ACCESS_CODE_KEY });
      canUseNativePreferences = true;
      const nativeCode = cleanCode(stored.value);
      if (nativeCode) return nativeCode;
    } catch {
      // Fall through to localStorage for older, not-yet-synced native builds.
    }
  }

  const fallbackCode = cleanCode(readLocalStorage(TTS_ACCESS_CODE_KEY));
  if (fallbackCode && canUseNativePreferences) {
    try {
      await Preferences.set({ key: TTS_ACCESS_CODE_KEY, value: fallbackCode });
      removeFromLocalStorage(TTS_ACCESS_CODE_KEY);
    } catch {
      // Continue using the local fallback for this native build.
    }
  }

  return fallbackCode;
}

export async function saveTtsAccessCode(code: string): Promise<void> {
  const cleaned = cleanCode(code);
  if (!cleaned) {
    throw new Error("EMPTY_TTS_ACCESS_CODE");
  }

  await removeLegacyClientElevenLabsCredentials();

  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.set({ key: TTS_ACCESS_CODE_KEY, value: cleaned });
      removeFromLocalStorage(TTS_ACCESS_CODE_KEY);
      return;
    } catch {
      // Keep the feature usable until the native project has been synced.
    }
  }

  if (!writeLocalStorage(TTS_ACCESS_CODE_KEY, cleaned)) {
    throw new Error("TTS_ACCESS_CODE_STORAGE_FAILED");
  }
}

export async function removeTtsAccessCode(): Promise<void> {
  removeFromLocalStorage(TTS_ACCESS_CODE_KEY);

  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.remove({ key: TTS_ACCESS_CODE_KEY });
    } catch {
      // The local fallback has already been removed.
    }
  }
}
