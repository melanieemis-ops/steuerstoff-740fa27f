import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import { normalizeTextForSpeech } from "@/lib/tts-normalize";

export type TtsStatus = "idle" | "playing" | "paused" | "ended";

export type TtsSection = {
  id: string;
  text: string;
};

type QueueItem = {
  id: string;
  text: string;
};

const RATE_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;

function chooseVoice(
  voices: SpeechSynthesisVoice[],
  savedVoiceURI?: string,
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  if (savedVoiceURI) {
    const saved = voices.find((voice) => voice.voiceURI === savedVoiceURI);
    if (saved) return saved;
  }

  const exactDe = voices.find((voice) => voice.lang === "de-DE");
  if (exactDe) return exactDe;

  const genericDe = voices.find((voice) => voice.lang.startsWith("de"));
  if (genericDe) return genericDe;

  return voices.find((voice) => voice.default) ?? voices[0] ?? null;
}

function listMeaningfulVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  if (!voices.length) return [];

  const german = voices
    .filter((voice) => voice.lang === "de-DE" || voice.lang.startsWith("de"))
    .sort((a, b) => {
      const aScore = a.lang === "de-DE" ? 0 : 1;
      const bScore = b.lang === "de-DE" ? 0 : 1;
      return aScore - bScore;
    });

  if (german.length > 0) return german;

  const fallback = chooseVoice(voices);
  return fallback ? [fallback] : [];
}

function splitIntoUtteranceChunks(text: string, maxLen = 550): string[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLen) {
      chunks.push(paragraph);
      continue;
    }

    const sentences = paragraph.split(/(?<=[.!?;])\s+/);
    let current = "";

    for (const sentence of sentences) {
      if (!sentence) continue;

      if ((current + " " + sentence).trim().length <= maxLen) {
        current = (current ? current + " " : "") + sentence;
        continue;
      }

      if (current) {
        chunks.push(current.trim());
      }

      if (sentence.length <= maxLen) {
        current = sentence;
        continue;
      }

      let rest = sentence;
      while (rest.length > maxLen) {
        chunks.push(rest.slice(0, maxLen).trim());
        rest = rest.slice(maxLen).trim();
      }
      current = rest;
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }
  }

  return chunks;
}

export function useTextToSpeech() {
  const isSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  const initialSettings = loadSpeechSettings();

  const [status, setStatus] = useState<TtsStatus>("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURIState] = useState<string | undefined>(initialSettings.voiceURI);
  const [rate, setRateState] = useState<number>(initialSettings.rate ?? 1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [totalSections, setTotalSections] = useState<number>(0);

  const queueRef = useRef<QueueItem[]>([]);
  const runTokenRef = useRef(0);

  const persistSettings = useCallback((nextRate: number, nextVoiceURI?: string) => {
    saveSpeechSettings({ rate: nextRate, voiceURI: nextVoiceURI });
  }, []);

  const setRate = useCallback(
    (nextRate: number) => {
      const safeRate = RATE_OPTIONS.includes(nextRate as (typeof RATE_OPTIONS)[number])
        ? nextRate
        : 1;
      setRateState(safeRate);
      persistSettings(safeRate, voiceURI);
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
      setStatus("idle");
      setCurrentSectionIndex(-1);
      setCurrentSectionId(null);
    },
    [isSupported, persistSettings, voiceURI],
  );

  const setVoice = useCallback(
    (nextVoiceURI?: string) => {
      setVoiceURIState(nextVoiceURI);
      persistSettings(rate, nextVoiceURI);
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
      setStatus("idle");
      setCurrentSectionIndex(-1);
      setCurrentSectionId(null);
    },
    [isSupported, persistSettings, rate],
  );

  const stop = useCallback(() => {
    runTokenRef.current += 1;
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setStatus("idle");
    setCurrentSectionIndex(-1);
    setCurrentSectionId(null);
  }, [isSupported]);

  const playSection = useCallback(
    (index: number, token: number) => {
      if (!isSupported) return;
      if (token !== runTokenRef.current) return;

      const item = queueRef.current[index];
      if (!item) {
        setStatus("ended");
        setCurrentSectionIndex(-1);
        setCurrentSectionId(null);
        return;
      }

      setCurrentSectionIndex(index);
      setCurrentSectionId(item.id);

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "de-DE";
      utterance.rate = rate;

      const selectedVoice = chooseVoice(window.speechSynthesis.getVoices(), voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        if (token !== runTokenRef.current) return;
        setStatus("playing");
      };

      utterance.onend = () => {
        if (token !== runTokenRef.current) return;
        playSection(index + 1, token);
      };

      utterance.onerror = (event) => {
        if (token !== runTokenRef.current) return;
        if (event.error === "interrupted" || event.error === "canceled") {
          return;
        }
        playSection(index + 1, token);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, voiceURI],
  );

  const speakSections = useCallback(
    (sections: TtsSection[]) => {
      if (!isSupported) return;

      const queue: QueueItem[] = [];
      for (const section of sections) {
        const normalized = normalizeTextForSpeech(section.text);
        if (!normalized) continue;

        const chunks = splitIntoUtteranceChunks(normalized);
        chunks.forEach((chunk, chunkIndex) => {
          queue.push({
            id: chunkIndex === 0 ? section.id : `${section.id}__chunk_${chunkIndex}`,
            text: chunk,
          });
        });
      }

      if (queue.length === 0) return;

      queueRef.current = queue;
      setTotalSections(queue.length);

      runTokenRef.current += 1;
      const token = runTokenRef.current;

      window.speechSynthesis.cancel();

      // Safari/iOS: kurzer Abstand nach cancel verhindert Doppelausfuehrungen.
      window.setTimeout(() => {
        if (token !== runTokenRef.current) return;
        playSection(0, token);
      }, 60);
    },
    [isSupported, playSection],
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    if (!window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    if (!window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    setStatus("playing");
  }, [isSupported]);

  const restart = useCallback(() => {
    const last = queueRef.current;
    if (!isSupported || last.length === 0) return;

    runTokenRef.current += 1;
    const token = runTokenRef.current;
    window.speechSynthesis.cancel();
    window.setTimeout(() => {
      if (token !== runTokenRef.current) return;
      playSection(0, token);
    }, 60);
  }, [isSupported, playSection]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    const cancelSpeech = () => {
      runTokenRef.current += 1;
      window.speechSynthesis.cancel();
    };

    window.addEventListener("pagehide", cancelSpeech);
    return () => {
      window.removeEventListener("pagehide", cancelSpeech);
      cancelSpeech();
    };
  }, [isSupported]);

  const availableVoices = useMemo(() => listMeaningfulVoices(voices), [voices]);

  return {
    isSupported,
    status,
    isSpeaking: status === "playing",
    isPaused: status === "paused",
    hasSession: queueRef.current.length > 0,
    rate,
    voiceURI,
    availableVoices,
    rateOptions: RATE_OPTIONS,
    speakSections,
    pause,
    resume,
    stop,
    restart,
    setRate,
    setVoice,
    currentSectionIndex,
    currentSectionId,
    totalSections,
  };
}
