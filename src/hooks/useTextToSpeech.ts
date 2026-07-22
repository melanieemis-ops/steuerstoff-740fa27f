import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import {
  clearSpeechAudioCache,
  getAudioCacheKey,
  getCachedAudioUrl,
  requestElevenLabsAudio,
  storeCachedAudioUrl,
  TtsApiError,
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
  if (error instanceof TtsApiError) {
    if (error.code === "INVALID_API_KEY") {
      return "Dein ElevenLabs API-Key ist ungültig.";
    }
    if (error.code === "VOICE_NOT_AVAILABLE") {
      return "Diese Stimme kann mit dem aktuellen ElevenLabs-Konto nicht verwendet werden.";
    }
    if (error.code === "VOICE_NOT_FOUND") {
      return "Die konfigurierte KI-Stimme wurde nicht gefunden.";
    }
    if (error.code === "QUOTA_EXCEEDED") {
      return "Das verfuegbare Sprachguthaben ist derzeit aufgebraucht.";
    }
    if (error.code === "CONFIGURATION_ERROR") {
      return "Bitte trage deinen ElevenLabs API-Key und deine Voice-ID in den Einstellungen ein.";
    }
    if (error.code === "TEXT_TOO_LONG") {
      return "Der Text ist zu lang und wird in Abschnitten vorgelesen.";
    }
  }

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
  const [allowBrowserFallback, setAllowBrowserFallbackState] = useState(false);
  const [voiceProfileId, setVoiceProfileIdState] = useState(
    initialSettings.profileId ?? TTS_VOICE_PROFILES[0].id,
  );
  const [voiceIdOverride, setVoiceIdOverrideState] = useState(initialSettings.voiceIdOverride);
  const [apiKey, setApiKeyState] = useState(initialSettings.apiKey);

  const queueRef = useRef<QueueItem[]>([]);
  const sectionDurationsRef = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestTokenRef = useRef(0);

  const persistSettings = useCallback(
    (next: {
      rate?: number;
      profileId?: string;
      voiceIdOverride?: string;
      apiKey?: string;
      allowBrowserFallback?: boolean;
    }) => {
      const merged = {
        ...loadSpeechSettings(),
        rate,
        profileId: voiceProfileId,
        voiceIdOverride,
        apiKey,
        allowBrowserFallback: false,
        ...next,
      };
      saveSpeechSettings(merged);
    },
    [apiKey, rate, voiceIdOverride, voiceProfileId],
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
    setTotalDuration(0);
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
    let total = 0;
    for (let i = 0; i < queue.length; i++) {
      const duration = durations[i];
      if (typeof duration !== "number" || !Number.isFinite(duration) || duration <= 0) {
        return 0;
      }
      total += duration;
    }
    return total;
  }, []);

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
        apiKey,
        voiceId: voiceIdOverride,
        profileId: voiceProfileId,
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
          setCurrentTime(0);
          setTotalDuration(0);
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
        const elapsed =
          getElapsedBefore(index) + (sectionDurationsRef.current[index] ?? item.estimatedSeconds);
        setCurrentTime(elapsed);
        void startFromIndex(index + 1, 0, true);
      };
      audio.onerror = () => {
        if (token !== requestTokenRef.current) return;
        setStatus("error");
        setErrorMessage("Die Sprachausgabe konnte gerade nicht geladen werden.");
        setCurrentTime(0);
        setTotalDuration(0);
      };
      audio.onloadedmetadata = () => {
        const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
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
      apiKey,
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
      if (!apiKey?.trim() || !voiceIdOverride?.trim()) {
        setStatus("error");
        setErrorMessage(
          "Bitte trage deinen ElevenLabs API-Key und deine Voice-ID in den Einstellungen ein.",
        );
        return;
      }

      const queue = buildQueue(sections);
      if (!queue.length) {
        setStatus("error");
        setErrorMessage("Die Sprachausgabe konnte gerade nicht geladen werden.");
        return;
      }

      queueRef.current = queue;
      sectionDurationsRef.current = queue.map(() => 0);
      setTotalSections(queue.length);
      setTotalDuration(0);
      setCurrentTime(0);

      requestTokenRef.current += 1;
      void startFromIndex(0, 0, true);
    },
    [apiKey, buildQueue, isSupported, startFromIndex, stopInternal, voiceIdOverride],
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
      if (!audio || currentSectionIndex < 0 || totalDuration <= 0) return;
      const nextTime = Math.max(0, audio.currentTime + seconds);
      audio.currentTime = nextTime;
      setCurrentTime(getElapsedBefore(currentSectionIndex) + nextTime);
    },
    [currentSectionIndex, getElapsedBefore, totalDuration],
  );

  const seekToProgress = useCallback(
    (fraction: number) => {
      if (totalDuration <= 0) return;
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

  const setApiKey = useCallback(
    (nextApiKey?: string) => {
      const cleaned = nextApiKey?.trim() ? nextApiKey.trim() : undefined;
      setApiKeyState(cleaned);
      persistSettings({ apiKey: cleaned });
    },
    [persistSettings],
  );

  const setAllowBrowserFallback = useCallback(
    (_enabled: boolean) => {
      setAllowBrowserFallbackState(false);
      persistSettings({ allowBrowserFallback: false });
    },
    [persistSettings],
  );

  const startBrowserFallback = useCallback(() => {
    setAllowBrowserFallbackState(false);
    setErrorMessage("Nur KI-Stimme (ElevenLabs) ist aktiviert.");
  }, []);

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
  const canStop = status === "loading" || status === "playing" || status === "paused";
  const canSeek = totalDuration > 0 && hasSession;

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
    apiKey,
    allowBrowserFallback,
    errorMessage,
    currentTime,
    totalDuration,
    progress,
    canStop,
    canSeek,
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
    setApiKey,
    setAllowBrowserFallback,
    startBrowserFallback,
  };
}
