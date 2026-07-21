import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import {
  clearSpeechAudioCache,
  getAudioCacheKey,
  getCachedAudioUrl,
  requestElevenLabsAudio,
  storeCachedAudioUrl,
  type TtsRequestPayload,
} from "@/lib/textToSpeechService";
import { splitTextForSpeech } from "@/lib/splitTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, TTS_VOICE_PROFILES } from "@/lib/ttsVoiceProfiles";

export type TtsStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export type TtsSection = {
  id: string;
  text: string;
};

type QueueItem = {
  id: string;
  text: string;
  estimatedSeconds: number;
};

const RATE_OPTIONS = [0.75, 1, 1.15, 1.25, 1.5] as const;

const CHUNK_MAX_LEN = 1150;

function estimateSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 2.4));
}

function formatErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (/internet|network|fetch|failed/i.test(msg)) {
    return "Bitte pruefe deine Internetverbindung und versuche es erneut.";
  }
  if (/zu lang|text ist zu lang/i.test(msg)) {
    return "Der Text ist zu lang und wird in Abschnitten vorgelesen.";
  }
  return "Die Sprachausgabe konnte gerade nicht geladen werden.";
}

export function useTextToSpeech() {
  const isSupported =
    typeof window !== "undefined" &&
    "Audio" in window &&
    typeof window.fetch === "function" &&
    "AbortController" in window;

  const initialSettings = loadSpeechSettings();

  const [status, setStatus] = useState<TtsStatus>("idle");
  const [rate, setRateState] = useState<number>(initialSettings.rate ?? 1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [totalSections, setTotalSections] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [allowBrowserFallback, setAllowBrowserFallbackState] = useState(
    initialSettings.allowBrowserFallback ?? false,
  );
  const [voiceProfileId, setVoiceProfileIdState] = useState(
    initialSettings.profileId ?? TTS_VOICE_PROFILES[0].id,
  );
  const [voiceIdOverride, setVoiceIdOverrideState] = useState(initialSettings.voiceIdOverride);

  const queueRef = useRef<QueueItem[]>([]);
  const sectionDurationsRef = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestTokenRef = useRef(0);
  const fallbackQueueRef = useRef<QueueItem[]>([]);

  const persistSettings = useCallback(
    (next: { rate?: number; profileId?: string; voiceIdOverride?: string; allowBrowserFallback?: boolean }) => {
      const merged = {
        ...loadSpeechSettings(),
        rate,
        profileId: voiceProfileId,
        voiceIdOverride,
        allowBrowserFallback,
        ...next,
      };
      saveSpeechSettings(merged);
    },
    [allowBrowserFallback, rate, voiceIdOverride, voiceProfileId],
  );

  const stopInternal = useCallback(() => {
    requestTokenRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setStatus("idle");
    setCurrentSectionIndex(-1);
    setCurrentSectionId(null);
    setCurrentTime(0);
    setErrorMessage(null);
  }, []);

  const getElapsedBefore = useCallback((index: number) => {
    let total = 0;
    const durations = sectionDurationsRef.current;
    const queue = queueRef.current;
    for (let i = 0; i < index; i++) {
      total += durations[i] ?? queue[i]?.estimatedSeconds ?? 0;
    }
    return total;
  }, []);

  const computeTotalDuration = useCallback(() => {
    const durations = sectionDurationsRef.current;
    const queue = queueRef.current;
    return queue.reduce((sum, item, index) => sum + (durations[index] ?? item.estimatedSeconds), 0);
  }, []);

  const playBrowserFallback = useCallback(
    (index: number, token: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (token !== requestTokenRef.current) return;
      const item = fallbackQueueRef.current[index];
      if (!item) {
        setStatus("ended");
        setCurrentSectionIndex(-1);
        setCurrentSectionId(null);
        return;
      }

      setCurrentSectionIndex(index);
      setCurrentSectionId(item.id);
      setCurrentTime(getElapsedBefore(index));

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = "de-DE";
      utterance.rate = rate;

      utterance.onstart = () => {
        if (token !== requestTokenRef.current) return;
        setStatus("playing");
      };
      utterance.onend = () => {
        if (token !== requestTokenRef.current) return;
        playBrowserFallback(index + 1, token);
      };
      utterance.onerror = () => {
        if (token !== requestTokenRef.current) return;
        playBrowserFallback(index + 1, token);
      };

      window.speechSynthesis.speak(utterance);
    },
    [getElapsedBefore, rate],
  );

  const startFromIndex = useCallback(
    async (index: number, startAtSeconds = 0, shouldPlay = true) => {
      const token = requestTokenRef.current;
      const queue = queueRef.current;
      const item = queue[index];

      if (!item) {
        setStatus("ended");
        setCurrentSectionIndex(-1);
        setCurrentSectionId(null);
        setCurrentTime(totalDuration);
        return;
      }

      setCurrentSectionIndex(index);
      setCurrentSectionId(item.id);
      setErrorMessage(null);
      setStatus("loading");

      const payload: TtsRequestPayload = {
        text: item.text,
        profileId: voiceProfileId,
        voiceId: voiceIdOverride?.trim() || undefined,
        modelId: DEFAULT_TTS_MODEL_ID,
      };

      const cacheKey = getAudioCacheKey(payload);
      let src = getCachedAudioUrl(cacheKey);

      if (!src) {
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const blob = await requestElevenLabsAudio(payload, controller.signal);
          if (token !== requestTokenRef.current) return;

          src = URL.createObjectURL(blob);
          storeCachedAudioUrl(cacheKey, src);
        } catch (error) {
          if (token !== requestTokenRef.current) return;
          const friendly = formatErrorMessage(error);
          setStatus("error");
          setErrorMessage(friendly);
          setCurrentSectionIndex(-1);
          setCurrentSectionId(null);
          return;
        } finally {
          abortRef.current = null;
        }
      }

      if (token !== requestTokenRef.current || !src) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.pause();
      audio.src = src;
      audio.preload = "auto";
      audio.playbackRate = rate;

      audio.ontimeupdate = () => {
        const elapsed = getElapsedBefore(index) + audio.currentTime;
        setCurrentTime(elapsed);
      };
      audio.onended = () => {
        if (token !== requestTokenRef.current) return;
        const elapsed = getElapsedBefore(index) + (sectionDurationsRef.current[index] ?? item.estimatedSeconds);
        setCurrentTime(elapsed);
        void startFromIndex(index + 1, 0, true);
      };
      audio.onerror = () => {
        if (token !== requestTokenRef.current) return;
        setStatus("error");
        setErrorMessage("Die Sprachausgabe konnte gerade nicht geladen werden.");
      };
      audio.onloadedmetadata = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : item.estimatedSeconds;
        sectionDurationsRef.current[index] = duration;
        setTotalDuration(computeTotalDuration());
      };

      if (startAtSeconds > 0) {
        audio.currentTime = Math.max(0, startAtSeconds);
      }

      if (!shouldPlay) {
        setStatus("paused");
        return;
      }

      try {
        await audio.play();
        if (token !== requestTokenRef.current) return;
        setStatus("playing");
      } catch {
        if (token !== requestTokenRef.current) return;
        setStatus("error");
        setErrorMessage("Bitte starte die Vorlesefunktion durch einen Klick erneut.");
      }
    },
    [
      computeTotalDuration,
      getElapsedBefore,
      rate,
      totalDuration,
      voiceIdOverride,
      voiceProfileId,
    ],
  );

  const buildQueue = useCallback((sections: TtsSection[]): QueueItem[] => {
    const queue: QueueItem[] = [];
    for (const section of sections) {
      const normalized = prepareTextForSpeech(section.text);
      if (!normalized) continue;

      const chunks = splitTextForSpeech(normalized, CHUNK_MAX_LEN);
      chunks.forEach((chunk, idx) => {
        queue.push({
          id: idx === 0 ? section.id : `${section.id}__chunk_${idx}`,
          text: chunk,
          estimatedSeconds: estimateSeconds(chunk),
        });
      });
    }
    return queue;
  }, []);

  const speakSections = useCallback(
    (sections: TtsSection[]) => {
      if (!isSupported) return;

      stopInternal();
      const queue = buildQueue(sections);
      if (!queue.length) {
        setStatus("error");
        setErrorMessage("Die Sprachausgabe konnte gerade nicht geladen werden.");
        return;
      }

      queueRef.current = queue;
      fallbackQueueRef.current = queue;
      sectionDurationsRef.current = queue.map((item) => item.estimatedSeconds);
      setTotalSections(queue.length);
      setTotalDuration(queue.reduce((sum, item) => sum + item.estimatedSeconds, 0));
      setCurrentTime(0);

      requestTokenRef.current += 1;
      void startFromIndex(0, 0, true);
    },
    [buildQueue, isSupported, startFromIndex, stopInternal],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && status === "playing") {
      audio.pause();
      setStatus("paused");
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, [status]);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (audio && status === "paused") {
      void audio.play();
      setStatus("playing");
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }, [status]);

  const stop = useCallback(() => {
    stopInternal();
  }, [stopInternal]);

  const restart = useCallback(() => {
    if (!queueRef.current.length) return;
    requestTokenRef.current += 1;
    void startFromIndex(0, 0, true);
  }, [startFromIndex]);

  const seekBy = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio || currentSectionIndex < 0) return;
      const nextTime = Math.max(0, audio.currentTime + seconds);
      audio.currentTime = nextTime;
      setCurrentTime(getElapsedBefore(currentSectionIndex) + nextTime);
    },
    [currentSectionIndex, getElapsedBefore],
  );

  const seekToProgress = useCallback(
    (fraction: number) => {
      const clamped = Math.min(1, Math.max(0, fraction));
      const target = totalDuration * clamped;
      const durations = sectionDurationsRef.current;
      const queue = queueRef.current;
      if (!queue.length) return;

      let acc = 0;
      for (let i = 0; i < queue.length; i++) {
        const d = durations[i] ?? queue[i].estimatedSeconds;
        if (target <= acc + d || i === queue.length - 1) {
          const sectionOffset = Math.max(0, target - acc);
          requestTokenRef.current += 1;
          void startFromIndex(i, sectionOffset, status !== "paused");
          return;
        }
        acc += d;
      }
    },
    [startFromIndex, status, totalDuration],
  );

  const setRate = useCallback(
    (nextRate: number) => {
      const safeRate = RATE_OPTIONS.includes(nextRate as (typeof RATE_OPTIONS)[number])
        ? nextRate
        : 1;
      setRateState(safeRate);
      persistSettings({ rate: safeRate });
      if (audioRef.current) {
        audioRef.current.playbackRate = safeRate;
      }
    },
    [persistSettings],
  );

  const setVoiceProfileId = useCallback(
    (profileId: string) => {
      setVoiceProfileIdState(profileId);
      persistSettings({ profileId });
    },
    [persistSettings],
  );

  const setVoiceIdOverride = useCallback(
    (voiceId?: string) => {
      const cleaned = voiceId?.trim() ? voiceId.trim() : undefined;
      setVoiceIdOverrideState(cleaned);
      persistSettings({ voiceIdOverride: cleaned });
    },
    [persistSettings],
  );

  const setAllowBrowserFallback = useCallback(
    (enabled: boolean) => {
      setAllowBrowserFallbackState(enabled);
      persistSettings({ allowBrowserFallback: enabled });
    },
    [persistSettings],
  );

  const startBrowserFallback = useCallback(() => {
    if (!allowBrowserFallback) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!fallbackQueueRef.current.length) return;

    stopInternal();
    requestTokenRef.current += 1;
    const token = requestTokenRef.current;
    playBrowserFallback(0, token);
  }, [allowBrowserFallback, playBrowserFallback, stopInternal]);

  useEffect(() => {
    const onPageHide = () => {
      stopInternal();
      clearSpeechAudioCache();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      stopInternal();
    };
  }, [stopInternal]);

  const hasSession = queueRef.current.length > 0;
  const progress = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;

  const voiceProfiles = useMemo(
    () => TTS_VOICE_PROFILES.map((profile) => ({ id: profile.id, label: profile.label })),
    [],
  );

  return {
    isSupported,
    status,
    isLoading: status === "loading",
    isSpeaking: status === "playing",
    isPaused: status === "paused",
    hasSession,
    rate,
    rateOptions: RATE_OPTIONS,
    voiceProfileId,
    voiceProfiles,
    voiceIdOverride,
    allowBrowserFallback,
    errorMessage,
    currentTime,
    totalDuration,
    progress,
    currentSectionIndex,
    currentSectionId,
    totalSections,
    speakSections,
    pause,
    resume,
    stop,
    restart,
    seekBy,
    seekToProgress,
    setRate,
    setVoiceProfileId,
    setVoiceIdOverride,
    setAllowBrowserFallback,
    startBrowserFallback,
  };
}
