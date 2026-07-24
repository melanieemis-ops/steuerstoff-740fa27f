import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  pauseBrowserSpeech,
  resumeBrowserSpeech,
  speakWithBrowser,
  stopBrowserSpeech,
} from "@/lib/browserSpeech";
import { prepareTextForSpeech } from "@/lib/prepareTextForSpeech";
import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import {
  clearSpeechAudioCache,
  getAudioCacheKey,
  getCachedAudioUrl,
  isTtsAbortError,
  requestSpeechAudio,
  storeCachedAudioUrl,
  TtsApiError,
  TTS_GENERIC_ERROR_MESSAGE,
  ttsErrorMessage,
  type TtsApiErrorCode,
  type TtsRequestPayload,
} from "@/lib/textToSpeechService";
import { splitTextForSpeech } from "@/lib/splitTextForSpeech";
import { DEFAULT_TTS_MODEL_ID, TTS_VOICE_PROFILES } from "@/lib/ttsVoiceProfiles";

export type TtsStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";
export type TtsSection = { id: string; text: string };
type QueueItem = { id: string; text: string; estimatedSeconds: number };

const RATE_OPTIONS = [0.75, 1, 1.15, 1.25, 1.5] as const;
const CHUNK_MAX_LEN = 1150;

function estimateSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 2.4));
}

export function useTextToSpeech() {
  const initialSettings = loadSpeechSettings();
  const isSupported = typeof window !== "undefined" &&
    (("Audio" in window && typeof window.fetch === "function") || "speechSynthesis" in window);

  const [status, setStatus] = useState<TtsStatus>("idle");
  const [rate, setRateState] = useState(initialSettings.rate ?? 1);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [totalSections, setTotalSections] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<TtsApiErrorCode | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [allowBrowserFallback, setAllowBrowserFallbackState] = useState(
    initialSettings.allowBrowserFallback !== false,
  );
  const [voiceProfileId, setVoiceProfileIdState] = useState(
    initialSettings.profileId ?? TTS_VOICE_PROFILES[0].id,
  );

  const queueRef = useRef<QueueItem[]>([]);
  const sectionDurationsRef = useRef<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const tokenRef = useRef(0);
  const browserActiveRef = useRef(false);

  const persistSettings = useCallback((next: { rate?: number; profileId?: string; allowBrowserFallback?: boolean }) => {
    saveSpeechSettings({
      ...loadSpeechSettings(),
      rate,
      profileId: voiceProfileId,
      allowBrowserFallback,
      ...next,
    });
  }, [allowBrowserFallback, rate, voiceProfileId]);

  const stopInternal = useCallback(() => {
    tokenRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    stopBrowserSpeech();
    browserActiveRef.current = false;
    setStatus("idle");
    setCurrentSectionIndex(-1);
    setCurrentSectionId(null);
    setCurrentTime(0);
    setTotalDuration(0);
    setErrorMessage(null);
    setErrorCode(null);
  }, []);

  const buildQueue = useCallback((sections: TtsSection[]): QueueItem[] => {
    const queue: QueueItem[] = [];
    for (const section of sections) {
      const normalized = prepareTextForSpeech(section.text);
      if (!normalized) continue;
      splitTextForSpeech(normalized, CHUNK_MAX_LEN).forEach((chunk, index) => {
        queue.push({
          id: index === 0 ? section.id : `${section.id}__chunk_${index}`,
          text: chunk,
          estimatedSeconds: estimateSeconds(chunk),
        });
      });
    }
    return queue;
  }, []);

  const startBrowserFallback = useCallback(() => {
    const queue = queueRef.current;
    if (!queue.length) return;
    const settings = { ...loadSpeechSettings(), rate };
    const text = queue.map((item) => item.text).join("\n\n");
    browserActiveRef.current = true;
    setErrorMessage(null);
    setErrorCode(null);
    setCurrentSectionIndex(0);
    setCurrentSectionId(queue[0].id);
    setTotalSections(queue.length);
    setTotalDuration(queue.reduce((sum, item) => sum + item.estimatedSeconds, 0));
    speakWithBrowser(text, settings, {
      onStart: () => setStatus("playing"),
      onEnd: () => {
        browserActiveRef.current = false;
        setStatus("ended");
        setCurrentSectionIndex(-1);
        setCurrentSectionId(null);
      },
      onError: (message) => {
        browserActiveRef.current = false;
        setStatus("error");
        setErrorCode("UNKNOWN_ERROR");
        setErrorMessage(message);
      },
    });
  }, [rate]);

  const startFromIndex = useCallback(async function playIndex(index: number, startAtSeconds = 0, shouldPlay = true): Promise<void> {
    const token = tokenRef.current;
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
    setStatus("loading");
    setErrorMessage(null);
    setErrorCode(null);

    const payload: TtsRequestPayload = {
      text: item.text,
      profileId: voiceProfileId,
      modelId: DEFAULT_TTS_MODEL_ID,
    };
    const cacheKey = getAudioCacheKey(payload);
    let src = getCachedAudioUrl(cacheKey);

    if (!src) {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const blob = await requestSpeechAudio(payload, controller.signal);
        if (token !== tokenRef.current) return;
        src = URL.createObjectURL(blob);
        storeCachedAudioUrl(cacheKey, src);
      } catch (error) {
        if (token !== tokenRef.current || isTtsAbortError(error)) return;
        const settings = loadSpeechSettings();
        if (settings.allowBrowserFallback !== false) {
          startBrowserFallback();
          return;
        }
        setStatus("error");
        setErrorCode(error instanceof TtsApiError ? error.code : "UNKNOWN_ERROR");
        setErrorMessage(ttsErrorMessage(error));
        return;
      } finally {
        abortRef.current = null;
      }
    }

    if (!src || token !== tokenRef.current) return;
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.src = src;
    audio.preload = "auto";
    audio.playbackRate = rate;
    audio.ontimeupdate = () => {
      const before = sectionDurationsRef.current.slice(0, index).reduce((sum, value, i) => sum + (value || queue[i].estimatedSeconds), 0);
      setCurrentTime(before + audio.currentTime);
    };
    audio.onloadedmetadata = () => {
      sectionDurationsRef.current[index] = Number.isFinite(audio.duration) ? audio.duration : item.estimatedSeconds;
      const complete = sectionDurationsRef.current.every((value) => value > 0);
      if (complete) setTotalDuration(sectionDurationsRef.current.reduce((sum, value) => sum + value, 0));
    };
    audio.onended = () => {
      if (token === tokenRef.current) void playIndex(index + 1, 0, true);
    };
    audio.onerror = () => {
      setStatus("error");
      setErrorCode("UNKNOWN_ERROR");
      setErrorMessage(TTS_GENERIC_ERROR_MESSAGE);
    };
    if (startAtSeconds > 0) audio.currentTime = startAtSeconds;
    if (!shouldPlay) {
      setStatus("paused");
      return;
    }
    try {
      await audio.play();
      if (token === tokenRef.current) setStatus("playing");
    } catch {
      setStatus("error");
      setErrorCode("UNKNOWN_ERROR");
      setErrorMessage(TTS_GENERIC_ERROR_MESSAGE);
    }
  }, [rate, startBrowserFallback, totalDuration, voiceProfileId]);

  const speakSections = useCallback((sections: TtsSection[]) => {
    if (!isSupported) return;
    stopInternal();
    const queue = buildQueue(sections);
    if (!queue.length) {
      setStatus("error");
      setErrorCode("UNKNOWN_ERROR");
      setErrorMessage(TTS_GENERIC_ERROR_MESSAGE);
      return;
    }
    queueRef.current = queue;
    sectionDurationsRef.current = queue.map(() => 0);
    setTotalSections(queue.length);
    setTotalDuration(queue.reduce((sum, item) => sum + item.estimatedSeconds, 0));
    tokenRef.current += 1;
    void startFromIndex(0, 0, true);
  }, [buildQueue, isSupported, startFromIndex, stopInternal]);

  const pause = useCallback(() => {
    if (browserActiveRef.current) pauseBrowserSpeech();
    else audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (browserActiveRef.current) resumeBrowserSpeech();
    else if (audioRef.current) void audioRef.current.play();
    setStatus("playing");
  }, []);

  const restart = useCallback(() => {
    if (!queueRef.current.length) return;
    if (browserActiveRef.current) {
      stopBrowserSpeech();
      startBrowserFallback();
      return;
    }
    tokenRef.current += 1;
    void startFromIndex(0, 0, true);
  }, [startBrowserFallback, startFromIndex]);

  const seekBy = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || browserActiveRef.current) return;
    audio.currentTime = Math.max(0, audio.currentTime + seconds);
  }, []);

  const seekToProgress = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio || browserActiveRef.current || totalDuration <= 0) return;
    const target = Math.min(1, Math.max(0, fraction)) * totalDuration;
    let elapsed = 0;
    for (let index = 0; index < queueRef.current.length; index += 1) {
      const duration = sectionDurationsRef.current[index] || queueRef.current[index].estimatedSeconds;
      if (target <= elapsed + duration) {
        tokenRef.current += 1;
        void startFromIndex(index, target - elapsed, status !== "paused");
        return;
      }
      elapsed += duration;
    }
  }, [startFromIndex, status, totalDuration]);

  const setRate = useCallback((nextRate: number) => {
    const safeRate = RATE_OPTIONS.includes(nextRate as (typeof RATE_OPTIONS)[number]) ? nextRate : 1;
    setRateState(safeRate);
    persistSettings({ rate: safeRate });
    if (audioRef.current) audioRef.current.playbackRate = safeRate;
  }, [persistSettings]);

  const setVoiceProfileId = useCallback((profileId: string) => {
    setVoiceProfileIdState(profileId);
    persistSettings({ profileId });
  }, [persistSettings]);

  const setAllowBrowserFallback = useCallback((enabled: boolean) => {
    setAllowBrowserFallbackState(enabled);
    persistSettings({ allowBrowserFallback: enabled });
  }, [persistSettings]);

  useEffect(() => {
    const sync = () => {
      const settings = loadSpeechSettings();
      setAllowBrowserFallbackState(settings.allowBrowserFallback !== false);
      setRateState(settings.rate ?? 1);
    };
    window.addEventListener("steuerstoff:speech-settings", sync);
    window.addEventListener("pagehide", stopInternal);
    return () => {
      window.removeEventListener("steuerstoff:speech-settings", sync);
      window.removeEventListener("pagehide", stopInternal);
      stopInternal();
      clearSpeechAudioCache();
    };
  }, [stopInternal]);

  const hasSession = queueRef.current.length > 0;
  const progress = totalDuration > 0 ? Math.min(1, currentTime / totalDuration) : 0;
  const canStop = status === "loading" || status === "playing" || status === "paused";
  const canSeek = !browserActiveRef.current && totalDuration > 0 && hasSession;
  const voiceProfiles = useMemo(() => TTS_VOICE_PROFILES.map((profile) => ({ id: profile.id, label: profile.label })), []);

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
    allowBrowserFallback,
    errorMessage,
    errorCode,
    errorNeedsSettings: errorCode === "MISSING_TTS_ACCESS_CODE" || errorCode === "INVALID_TTS_ACCESS_CODE",
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
    stop: stopInternal,
    restart,
    seekBy,
    seekToProgress,
    setRate,
    setVoiceProfileId,
    setAllowBrowserFallback,
    startBrowserFallback,
  };
}
