import type { SpeechSettings } from "@/lib/speech-storage";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function browserSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopBrowserSpeech(): void {
  if (!browserSpeechSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function pauseBrowserSpeech(): void {
  if (!browserSpeechSupported()) return;
  window.speechSynthesis.pause();
}

export function resumeBrowserSpeech(): void {
  if (!browserSpeechSupported()) return;
  window.speechSynthesis.resume();
}

export function speakWithBrowser(
  text: string,
  settings: SpeechSettings,
  callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (message: string) => void;
  } = {},
): SpeechSynthesisUtterance {
  if (!browserSpeechSupported()) {
    throw new Error("Die Browserstimme wird auf diesem Gerät nicht unterstützt.");
  }

  stopBrowserSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = settings.rate ?? 1;

  const voices = window.speechSynthesis.getVoices();
  const selected = settings.voiceURI
    ? voices.find((voice) => voice.voiceURI === settings.voiceURI)
    : voices.find((voice) => voice.lang.toLowerCase().startsWith("de"));
  if (selected) utterance.voice = selected;

  utterance.onstart = () => callbacks.onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    callbacks.onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    callbacks.onError?.("Die Browserstimme konnte nicht gestartet werden.");
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return utterance;
}
