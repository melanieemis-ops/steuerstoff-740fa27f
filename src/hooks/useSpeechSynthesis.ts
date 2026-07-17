import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getDefaultSpeechSettings,
  loadSpeechSettings,
  saveSpeechSettings,
  type SpeechSettings,
} from "@/lib/speech-storage";
import { prepareTextForSpeech, splitTextForSpeech } from "@/lib/speech-utils";

export type SpeechPlaybackState = "idle" | "playing" | "paused";

interface SpeakInput {
  messageId: string;
  content: string;
}

function selectPreferredVoice(
  voices: SpeechSynthesisVoice[],
  preferredURI?: string,
): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;

  if (preferredURI) {
    const selected = voices.find((voice) => voice.voiceURI === preferredURI);
    if (selected) return selected;
  }

  const deDe = voices.find((voice) => /^de-DE$/i.test(voice.lang));
  if (deDe) return deDe;

  const de = voices.find((voice) => /^de([-_].+)?$/i.test(voice.lang));
  if (de) return de;

  return voices.find((voice) => voice.default) ?? voices[0];
}

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>(getDefaultSpeechSettings());
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<SpeechPlaybackState>("idle");

  const sessionRef = useRef(0);
  const queueRef = useRef<string[]>([]);
  const indexRef = useRef(0);
  const settingsRef = useRef<SpeechSettings>(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    sessionRef.current += 1;
    queueRef.current = [];
    indexRef.current = 0;
    window.speechSynthesis.cancel();
    setPlaybackState("idle");
    setActiveMessageId(null);
  }, []);

  const speakQueueChunk = useCallback((session: number, messageId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !("SpeechSynthesisUtterance" in window)) {
      return;
    }

    const chunk = queueRef.current[indexRef.current];
    if (!chunk) {
      setPlaybackState("idle");
      setActiveMessageId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = "de-DE";
    utterance.rate = settingsRef.current.rate;

    const voice = selectPreferredVoice(voices, settingsRef.current.voiceURI);
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (sessionRef.current !== session) return;
      indexRef.current += 1;
      if (indexRef.current >= queueRef.current.length) {
        setPlaybackState("idle");
        setActiveMessageId(null);
        return;
      }
      speakQueueChunk(session, messageId);
    };

    utterance.onerror = () => {
      if (sessionRef.current !== session) return;
      setPlaybackState("idle");
      setActiveMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const speak = useCallback(({ messageId, content }: SpeakInput) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !("SpeechSynthesisUtterance" in window)) {
      return false;
    }

    const prepared = prepareTextForSpeech(content);
    const chunks = splitTextForSpeech(prepared);
    if (!chunks.length) return false;

    // Always stop previous playback first to guarantee a single active answer.
    window.speechSynthesis.cancel();

    sessionRef.current += 1;
    const currentSession = sessionRef.current;
    queueRef.current = chunks;
    indexRef.current = 0;
    setActiveMessageId(messageId);
    setPlaybackState("playing");

    speakQueueChunk(currentSession, messageId);
    return true;
  }, [speakQueueChunk]);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setPlaybackState((prev) => (prev === "playing" ? "paused" : prev));
  }, []);

  const resume = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.resume();
    setPlaybackState((prev) => (prev === "paused" ? "playing" : prev));
  }, []);

  const toggle = useCallback((input: SpeakInput) => {
    if (activeMessageId !== input.messageId || playbackState === "idle") {
      return speak(input);
    }
    if (playbackState === "playing") {
      pause();
      return true;
    }
    resume();
    return true;
  }, [activeMessageId, pause, playbackState, resume, speak]);

  const setRate = useCallback((rate: number) => {
    setSettings((prev) => {
      const next = { ...prev, rate };
      saveSpeechSettings(next);
      return next;
    });
  }, []);

  const setVoiceURI = useCallback((voiceURI?: string) => {
    setSettings((prev) => {
      const next = { ...prev, voiceURI: voiceURI || undefined };
      saveSpeechSettings(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setIsSupported(supported);
    setSettings(loadSpeechSettings());
    if (!supported) return;

    const updateVoices = () => {
      const loaded = window.speechSynthesis.getVoices();
      setVoices(loaded);
    };

    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const selectedVoice = useMemo(
    () => selectPreferredVoice(voices, settings.voiceURI),
    [voices, settings.voiceURI],
  );

  const statusMessage = useMemo(() => {
    if (!isSupported) {
      return "Die Vorlesefunktion wird von diesem Browser leider nicht unterstützt.";
    }
    if (playbackState === "playing") return "Wird vorgelesen …";
    if (playbackState === "paused") return "Vorlesen pausiert";
    return "";
  }, [isSupported, playbackState]);

  return {
    isSupported,
    voices,
    settings,
    activeMessageId,
    playbackState,
    selectedVoice,
    statusMessage,
    speak,
    toggle,
    pause,
    resume,
    stop,
    setRate,
    setVoiceURI,
  };
}
