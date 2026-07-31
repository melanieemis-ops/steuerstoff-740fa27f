import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { loadSpeechSettings, saveSpeechSettings, type TtsProvider } from "@/lib/speech-storage";
import {
  isTtsAbortError,
  requestSpeechAudio,
  ttsErrorMessage,
  ttsErrorNeedsSettings,
} from "@/lib/textToSpeechService";

interface KnowledgeBaseReaderProps {
  title?: string;
  content: string;
}

const SILENT_AUDIO_DATA_URL =
  "data:audio/wav;base64,UklGRiUAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQEAAACA";
const PLAYBACK_RATES = [1, 1.25, 1.5] as const;
const AUDIO_CHUNK_LENGTH = 500;
type PlaybackRate = (typeof PLAYBACK_RATES)[number];
type SpeechMode = "audio" | "browser" | null;

function prepareTextForSpeech(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__|\*|_)/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\|/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitLongSentence(sentence: string, maxLength: number): string[] {
  if (sentence.length <= maxLength) return [sentence];
  const parts = sentence.split(/(?<=[,;:])\s+/);
  const result: string[] = [];
  let current = "";

  for (const part of parts) {
    const next = current ? `${current} ${part}` : part;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }
    if (current) result.push(current);
    if (part.length <= maxLength) {
      current = part;
    } else {
      for (let index = 0; index < part.length; index += maxLength) {
        result.push(part.slice(index, index + maxLength));
      }
      current = "";
    }
  }
  if (current) result.push(current);
  return result;
}

function splitTextIntoChunks(text: string, maxLength = AUDIO_CHUNK_LENGTH): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()).filter(Boolean) ?? [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    for (const part of splitLongSentence(sentence, maxLength)) {
      const next = current ? `${current} ${part}` : part;
      if (next.length <= maxLength) {
        current = next;
      } else {
        if (current) chunks.push(current);
        current = part;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

function splitBrowserSpeech(text: string): string[] {
  return splitTextIntoChunks(text, 260);
}

function selectGermanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const german = voices.filter((voice) => voice.lang.toLowerCase().startsWith("de"));
  return (
    german.find((voice) => /anna|petra|katja|siri|premium|enhanced/i.test(voice.name)) ??
    german.find((voice) => voice.localService) ??
    german[0] ??
    voices[0]
  );
}

async function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  const synthesis = window.speechSynthesis;
  const existing = synthesis.getVoices();
  if (existing.length) return existing;
  return new Promise((resolve) => {
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      synthesis.removeEventListener("voiceschanged", done);
      resolve(synthesis.getVoices());
    };
    synthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 800);
  });
}

function providerLabel(provider: TtsProvider): string {
  if (provider === "gemini") return "Gemini AI";
  if (provider === "elevenlabs") return "ElevenLabs";
  return "OpenAI";
}

export default function KnowledgeBaseReader({ title, content }: KnowledgeBaseReaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const controllersRef = useRef(new Set<AbortController>());
  const sessionRef = useRef(0);
  const playbackRateRef = useRef<PlaybackRate>(1);
  const modeRef = useRef<SpeechMode>(null);

  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [totalParts, setTotalParts] = useState(0);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNeedsSettings, setErrorNeedsSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);

  const releaseAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const destroyAudio = useCallback(() => {
    releaseAudio();
    const audio = audioRef.current;
    if (audio) {
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    }
  }, [releaseAudio]);

  const stopReading = useCallback(() => {
    sessionRef.current += 1;
    for (const controller of controllersRef.current) controller.abort();
    controllersRef.current.clear();
    destroyAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    modeRef.current = null;
    setIsPreparing(false);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPart(0);
    setTotalParts(0);
    setStatusText(null);
  }, [destroyAudio]);

  const requestChunk = useCallback(async (text: string, provider: TtsProvider, sessionId: number): Promise<Blob> => {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (sessionId !== sessionRef.current) throw new DOMException("Abgebrochen", "AbortError");
      const controller = new AbortController();
      controllersRef.current.add(controller);
      try {
        return await requestSpeechAudio({ text, provider }, controller.signal);
      } catch (error) {
        lastError = error;
        if (isTtsAbortError(error) || attempt === 1) throw error;
      } finally {
        controllersRef.current.delete(controller);
      }
    }
    throw lastError;
  }, []);

  const playAudioBlob = useCallback((blob: Blob, sessionId: number) =>
    new Promise<void>((resolve, reject) => {
      if (sessionId !== sessionRef.current) return resolve();
      releaseAudio();
      const url = URL.createObjectURL(blob);
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.src = url;
      objectUrlRef.current = url;
      modeRef.current = "audio";
      audio.playbackRate = playbackRateRef.current;
      audio.onplay = () => {
        setIsPreparing(false);
        setStatusText(null);
        setIsPlaying(true);
        setIsPaused(false);
      };
      audio.onpause = () => {
        if (!audio.ended) {
          setIsPlaying(false);
          setIsPaused(true);
        }
      };
      audio.onended = () => {
        releaseAudio();
        resolve();
      };
      audio.onerror = () => reject(new Error(`Audio-Wiedergabe fehlgeschlagen (MediaError ${audio.error?.code ?? "?"}).`));
      audio.play().catch((playError: unknown) => {
        const detail = playError instanceof Error ? `${playError.name}: ${playError.message}` : String(playError);
        reject(new Error(`Audio-Wiedergabe blockiert (${detail})`));
      });
    }), [releaseAudio]);

  const speakWithBrowser = async (text: string, sessionId: number, failedProvider: TtsProvider) => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      throw new Error("Auf diesem Gerät ist keine Browserstimme verfügbar.");
    }
    const synthesis = window.speechSynthesis;
    synthesis.cancel();
    const voice = selectGermanVoice(await loadBrowserVoices());
    const chunks = splitBrowserSpeech(text);
    modeRef.current = "browser";
    setTotalParts(chunks.length);
    setNotice(`${providerLabel(failedProvider)} konnte nicht gestartet werden. Die Gerätestimme wird als Rückfallebene verwendet.`);

    for (let index = 0; index < chunks.length; index += 1) {
      if (sessionId !== sessionRef.current) return;
      setCurrentPart(index + 1);
      await new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunks[index]);
        utterance.lang = voice?.lang || "de-DE";
        utterance.voice = voice ?? null;
        utterance.rate = playbackRateRef.current;
        utterance.onstart = () => {
          setIsPreparing(false);
          setIsPlaying(true);
          setIsPaused(false);
        };
        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Browserstimme fehlgeschlagen: ${event.error}`));
        synthesis.speak(utterance);
      });
    }
  };

  const startReading = async () => {
    stopReading();
    setError(null);
    setNotice(null);
    setErrorNeedsSettings(false);

    const prepared = prepareTextForSpeech([title, content].filter(Boolean).join("\n\n"));
    if (!prepared) {
      setError("Für diesen Beitrag wurde kein vorlesbarer Text gefunden.");
      return;
    }

    const settings = loadSpeechSettings();
    const provider = settings.provider ?? "gemini";
    const sessionId = sessionRef.current;
    setIsPreparing(true);

    try {
      const primedAudio = new Audio(SILENT_AUDIO_DATA_URL);
      audioRef.current = primedAudio;
      void primedAudio.play().catch(() => undefined);

      const chunks = splitTextIntoChunks(prepared);
      setTotalParts(chunks.length);
      const pending = new Map<number, Promise<Blob>>();
      const preload = (index: number) => {
        if (index >= chunks.length || pending.has(index)) return;
        pending.set(index, requestChunk(chunks[index], provider, sessionId));
      };

      preload(0);
      preload(1);

      for (let index = 0; index < chunks.length; index += 1) {
        if (sessionId !== sessionRef.current) return;
        setCurrentPart(index + 1);
        setIsPreparing(true);
        setStatusText(index === 0 ? "Abschnitt 1 wird vorbereitet …" : "Der nächste Abschnitt wird vorbereitet …");

        preload(index);
        preload(index + 1);
        const blob = await pending.get(index)!;
        pending.delete(index);
        preload(index + 2);
        await playAudioBlob(blob, sessionId);
      }
    } catch (ttsError) {
      if (sessionId !== sessionRef.current || isTtsAbortError(ttsError)) return;
      console.error("[tts] Vorlesen fehlgeschlagen", ttsError);
      releaseAudio();
      const message = ttsErrorMessage(ttsError);
      setErrorNeedsSettings(ttsErrorNeedsSettings(ttsError));
      setError(`${providerLabel(provider)}: ${message}`);

      if (settings.allowBrowserFallback === false) return;
      try {
        await speakWithBrowser(prepared, sessionId, provider);
      } catch (browserError) {
        setError(`${providerLabel(provider)}: ${message} Auch die Browserstimme konnte nicht gestartet werden: ${browserError instanceof Error ? browserError.message : "Unbekannter Fehler"}`);
      }
    } finally {
      if (sessionId === sessionRef.current) {
        for (const controller of controllersRef.current) controller.abort();
        controllersRef.current.clear();
        setIsPreparing(false);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPart(0);
        setTotalParts(0);
        setStatusText(null);
        modeRef.current = null;
      }
    }
  };

  const togglePause = async () => {
    if (modeRef.current === "browser") {
      const synthesis = window.speechSynthesis;
      if (synthesis.paused) {
        synthesis.resume();
        setIsPaused(false);
        setIsPlaying(true);
      } else {
        synthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  const changePlaybackRate = (nextRate: PlaybackRate) => {
    playbackRateRef.current = nextRate;
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    saveSpeechSettings({ ...loadSpeechSettings(), rate: nextRate });
    if (modeRef.current === "browser" && (isPlaying || isPaused)) {
      setNotice("Das neue Tempo gilt bei der Browserstimme ab dem nächsten Abschnitt.");
    }
  };

  useEffect(() => {
    const savedRate = loadSpeechSettings().rate;
    if (PLAYBACK_RATES.includes(savedRate as PlaybackRate)) {
      playbackRateRef.current = savedRate as PlaybackRate;
      setPlaybackRate(savedRate as PlaybackRate);
    }
  }, []);

  useEffect(() => () => stopReading(), [stopReading]);

  return (
    <div className="my-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying && !isPaused && !isPreparing && (
          <button type="button" onClick={startReading} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            🔊 Beitrag vorlesen
          </button>
        )}
        {(isPlaying || isPaused) && (
          <button type="button" onClick={togglePause} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            {isPaused ? "▶️ Weiter" : "⏸ Pause"}
          </button>
        )}
        {(isPlaying || isPaused || isPreparing) && (
          <button type="button" onClick={stopReading} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800">
            ⏹ Beenden
          </button>
        )}
        {isPreparing && <span className="text-sm text-slate-500">{statusText ?? "Stimme wird vorbereitet …"}</span>}
        {totalParts > 1 && currentPart > 0 && <span className="text-sm text-slate-500">Abschnitt {currentPart} von {totalParts}</span>}
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Wiedergabegeschwindigkeit">
          <span className="px-1.5 text-xs font-medium text-slate-500">Tempo</span>
          {PLAYBACK_RATES.map((rate) => {
            const selected = playbackRate === rate;
            const label = `${rate.toString().replace(".", ",")}×`;
            return (
              <button key={rate} type="button" onClick={() => changePlaybackRate(rate)} aria-pressed={selected} className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-lg px-2 text-xs font-semibold ${selected ? "bg-slate-900 text-white shadow-sm" : "text-slate-600"}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {notice && <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{notice}</div>}
      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{error}</p>
          {errorNeedsSettings && (
            <Link to="/einstellungen" className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium text-red-800">
              Zu den Einstellungen
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
