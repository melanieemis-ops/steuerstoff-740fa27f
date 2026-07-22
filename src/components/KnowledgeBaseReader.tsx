import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import {
  isTtsAbortError,
  requestElevenLabsAudio,
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

type PlaybackRate = (typeof PLAYBACK_RATES)[number];

function isPlaybackBlockedError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotAllowedError";
}

function playbackErrorMessage(error: unknown): string {
  if (isPlaybackBlockedError(error)) {
    return "Die Vorschau hat den automatischen Audiostart blockiert. Tippe auf „Weiter“, um die Wiedergabe freizugeben.";
  }

  return ttsErrorMessage(error);
}

function prepareTextForSpeech(value: string): string {
  return (
    value
      // Codeblöcke vollständig entfernen
      .replace(/```[\s\S]*?```/g, " ")

      // Inline-Code lesbar machen
      .replace(/`([^`]+)`/g, "$1")

      // Bilder entfernen
      .replace(/!\[[^\]]*]\([^)]*\)/g, " ")

      // Links: nur den sichtbaren Linktext behalten
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")

      // Markdown-Überschriften entfernen
      .replace(/^#{1,6}\s+/gm, "")

      // Fettdruck und Kursivschrift entfernen
      .replace(/(\*\*|__|\*|_)/g, "")

      // Listenzeichen entfernen
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")

      // Blockquotes entfernen
      .replace(/^\s*>\s?/gm, "")

      // Tabellenzeichen und HTML-Tags entfernen
      .replace(/\|/g, " ")
      .replace(/<[^>]+>/g, " ")

      // Mehrfache Leerzeichen und Leerzeilen reduzieren
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function splitTextIntoChunks(text: string, maxLength = 2200): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = "";

  const addChunk = () => {
    const cleaned = currentChunk.trim();

    if (cleaned) {
      chunks.push(cleaned);
    }

    currentChunk = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length <= maxLength) {
      const combined = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

      if (combined.length <= maxLength) {
        currentChunk = combined;
      } else {
        addChunk();
        currentChunk = paragraph;
      }

      continue;
    }

    // Sehr lange Absätze zusätzlich nach Sätzen aufteilen
    const sentences = paragraph
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((sentence) => sentence.trim()) ?? [paragraph];

    for (const sentence of sentences) {
      const combined = currentChunk ? `${currentChunk} ${sentence}` : sentence;

      if (combined.length <= maxLength) {
        currentChunk = combined;
      } else {
        addChunk();

        // Falls selbst ein einzelner Satz zu lang ist
        if (sentence.length > maxLength) {
          for (let index = 0; index < sentence.length; index += maxLength) {
            chunks.push(sentence.slice(index, index + maxLength));
          }
        } else {
          currentChunk = sentence;
        }
      }
    }
  }

  addChunk();

  return chunks;
}

export default function KnowledgeBaseReader({ title, content }: KnowledgeBaseReaderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const readingSessionRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingPlaybackRejectRef = useRef<((reason?: unknown) => void) | null>(null);
  const playbackRateRef = useRef<PlaybackRate>(1);

  const [isPreparing, setIsPreparing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPart, setCurrentPart] = useState(0);
  const [totalParts, setTotalParts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorNeedsSettings, setErrorNeedsSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(1);

  const releaseCurrentAudio = useCallback((preserveElement = false) => {
    const audio = audioRef.current;

    if (audio) {
      audio.onplay = null;
      audio.onpause = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();

      if (!preserveElement) {
        audioRef.current = null;
      }
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const abortPendingRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const stopReading = () => {
    readingSessionRef.current += 1;
    pendingPlaybackRejectRef.current?.(new DOMException("Abgebrochen", "AbortError"));
    pendingPlaybackRejectRef.current = null;
    abortPendingRequest();
    releaseCurrentAudio();

    setIsPreparing(false);
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPart(0);
    setTotalParts(0);
    setErrorNeedsSettings(false);
  };

  const playAudioBlob = (blob: Blob, sessionId: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (sessionId !== readingSessionRef.current) {
        resolve();
        return;
      }

      releaseCurrentAudio(true);

      const objectUrl = URL.createObjectURL(blob);
      const audio = audioRef.current ?? new Audio();

      pendingPlaybackRejectRef.current = reject;
      objectUrlRef.current = objectUrl;
      audioRef.current = audio;
      audio.src = objectUrl;
      audio.preload = "auto";
      audio.playbackRate = playbackRateRef.current;

      audio.onplay = () => {
        setError(null);
        setIsPreparing(false);
        setIsPlaying(true);
        setIsPaused(false);
      };

      audio.onpause = () => {
        if (!audio.ended && sessionId === readingSessionRef.current) {
          setIsPaused(true);
          setIsPlaying(false);
        }
      };

      audio.onended = () => {
        pendingPlaybackRejectRef.current = null;
        releaseCurrentAudio(true);
        resolve();
      };

      audio.onerror = () => {
        pendingPlaybackRejectRef.current = null;
        releaseCurrentAudio(true);
        reject(new Error("Die Audiodatei konnte nicht abgespielt werden."));
      };

      audio.play().catch((playError: unknown) => {
        if (isPlaybackBlockedError(playError)) {
          setIsPreparing(false);
          setIsPlaying(false);
          setIsPaused(true);
          setError(playbackErrorMessage(playError));
          return;
        }

        pendingPlaybackRejectRef.current = null;
        releaseCurrentAudio(true);

        reject(
          playError instanceof Error
            ? playError
            : new Error("Die Wiedergabe konnte nicht gestartet werden."),
        );
      });
    });
  };

  const startReading = async () => {
    stopReading();
    setError(null);
    setErrorNeedsSettings(false);

    const preparedContent = prepareTextForSpeech([title, content].filter(Boolean).join("\n\n"));

    if (!preparedContent) {
      setError("Für diesen Beitrag wurde kein vorlesbarer Text gefunden.");
      return;
    }

    // iOS/Safari erlaubt die spätere Wiedergabe nach dem Netzwerkaufruf nur,
    // wenn dasselbe Audioelement bereits direkt im Klick freigeschaltet wurde.
    const primedAudio = new Audio(SILENT_AUDIO_DATA_URL);
    primedAudio.preload = "auto";
    audioRef.current = primedAudio;
    void primedAudio.play().catch(() => {
      // Der eigentliche Wiedergabeversuch liefert unten eine verständliche Meldung.
    });

    const chunks = splitTextIntoChunks(preparedContent);
    const sessionId = readingSessionRef.current;

    setTotalParts(chunks.length);
    setIsPreparing(true);

    try {
      for (let index = 0; index < chunks.length; index += 1) {
        if (sessionId !== readingSessionRef.current) {
          return;
        }

        setCurrentPart(index + 1);
        setIsPreparing(true);

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        let audioBlob: Blob;
        try {
          audioBlob = await requestElevenLabsAudio(
            {
              text: chunks[index],
            },
            abortController.signal,
          );
        } finally {
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
          }
        }

        if (sessionId !== readingSessionRef.current) {
          return;
        }

        await playAudioBlob(audioBlob, sessionId);
      }

      if (sessionId === readingSessionRef.current) {
        releaseCurrentAudio();
        setIsPreparing(false);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPart(0);
        setTotalParts(0);
      }
    } catch (unknownError) {
      if (sessionId !== readingSessionRef.current) {
        return;
      }
      if (isTtsAbortError(unknownError)) {
        return;
      }

      releaseCurrentAudio();
      setIsPreparing(false);
      setIsPlaying(false);
      setIsPaused(false);

      setErrorNeedsSettings(ttsErrorNeedsSettings(unknownError));
      setError(playbackErrorMessage(unknownError));
    }
  };

  const togglePause = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (playError) {
        setError(playbackErrorMessage(playError));
      }
    } else {
      audio.pause();
    }
  };

  const changePlaybackRate = (nextRate: PlaybackRate) => {
    playbackRateRef.current = nextRate;
    setPlaybackRate(nextRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }

    saveSpeechSettings({
      ...loadSpeechSettings(),
      rate: nextRate,
    });
  };

  useEffect(() => {
    const savedRate = loadSpeechSettings().rate;
    if (PLAYBACK_RATES.includes(savedRate as PlaybackRate)) {
      const supportedRate = savedRate as PlaybackRate;
      playbackRateRef.current = supportedRate;
      setPlaybackRate(supportedRate);
    }
  }, []);

  useEffect(() => {
    return () => {
      readingSessionRef.current += 1;
      pendingPlaybackRejectRef.current?.(new DOMException("Abgebrochen", "AbortError"));
      pendingPlaybackRejectRef.current = null;
      abortPendingRequest();
      releaseCurrentAudio();
    };
  }, [abortPendingRequest, releaseCurrentAudio]);

  return (
    <div className="my-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {!isPlaying && !isPaused && !isPreparing && (
          <button
            type="button"
            onClick={startReading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            🔊 Beitrag vorlesen
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            {isPaused ? "▶️ Weiter" : "⏸ Pause"}
          </button>
        )}

        {(isPlaying || isPaused || isPreparing) && (
          <button
            type="button"
            onClick={stopReading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            ⏹ Beenden
          </button>
        )}

        {isPreparing && <span className="text-sm text-slate-500">Stimme wird vorbereitet …</span>}

        {totalParts > 1 && currentPart > 0 && (
          <span className="text-sm text-slate-500">
            Abschnitt {currentPart} von {totalParts}
          </span>
        )}

        <div
          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="group"
          aria-label="Wiedergabegeschwindigkeit"
        >
          <span className="px-1.5 text-xs font-medium text-slate-500">Tempo</span>
          {PLAYBACK_RATES.map((rate) => {
            const selected = playbackRate === rate;
            const label = `${rate.toString().replace(".", ",")}×`;

            return (
              <button
                key={rate}
                type="button"
                onClick={() => changePlaybackRate(rate)}
                aria-label={`Wiedergabegeschwindigkeit ${label}`}
                aria-pressed={selected}
                className={`inline-flex min-h-9 min-w-11 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                  selected
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <p>{error}</p>
          {errorNeedsSettings && (
            <Link
              to="/einstellungen"
              className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium text-red-800 hover:bg-red-100"
            >
              Zu den Einstellungen
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
