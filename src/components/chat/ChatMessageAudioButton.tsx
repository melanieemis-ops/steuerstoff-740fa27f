/**
 * ChatMessageAudioButton.tsx
 *
 * Vorlese-Button für eine abgeschlossene Assistant-Antwort.
 * - Erzeugt beim ersten Klick über den zentralen TTS-Service ein MP3.
 * - Cacht das Ergebnis pro Antworttext (Session).
 * - Nur eine Chat-Antwort spielt gleichzeitig.
 */

import { AlertCircle, Loader2, Pause, Play, Square, Volume2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  getCachedAudioUrl,
  hashText,
  onAudioStop,
  requestStopAllAudio,
  setCachedAudioUrl,
} from "@/lib/chatTtsClient";
import {
  isTtsAbortError,
  requestElevenLabsAudio,
  ttsErrorMessage,
  ttsErrorNeedsSettings,
} from "@/lib/textToSpeechService";

type Props = {
  messageId: string;
  text: string;
  isStreaming?: boolean;
};

const SPEEDS = [1, 1.25, 1.5] as const;
type Speed = (typeof SPEEDS)[number];

type Status = "idle" | "loading" | "ready" | "error";

export function ChatMessageAudioButton({ messageId, text, isStreaming = false }: Props) {
  const trimmed = text.trim();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const instanceId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorNeedsSettings, setErrorNeedsSettings] = useState(false);

  const stopThisAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
    }
    setIsPlaying(false);
  }, []);

  // Andere Audio-Ausgabe stoppt diese hier.
  useEffect(() => {
    return onAudioStop((source) => {
      if (source === instanceId) return;
      stopThisAudio();
    });
  }, [instanceId, stopThisAudio]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      const el = audioRef.current;
      if (el) el.pause();
    };
  }, []);

  const attachAudio = useCallback(
    (url: string) => {
      const el = new Audio(url);
      el.preload = "auto";
      el.playbackRate = speed;
      el.addEventListener("play", () => setIsPlaying(true));
      el.addEventListener("pause", () => setIsPlaying(false));
      el.addEventListener("ended", () => setIsPlaying(false));
      el.addEventListener("error", () => {
        setStatus("error");
        setErrorMsg("Wiedergabe fehlgeschlagen.");
        setIsPlaying(false);
      });
      audioRef.current = el;
      return el;
    },
    [speed],
  );

  const play = useCallback(
    async (el: HTMLAudioElement) => {
      requestStopAllAudio(instanceId);
      try {
        await el.play();
      } catch {
        setStatus("error");
        setErrorMsg("Wiedergabe konnte nicht gestartet werden.");
      }
    },
    [instanceId],
  );

  const handleClick = useCallback(async () => {
    if (isStreaming || !trimmed) return;

    // Bereits geladen → Play/Pause
    const existing = audioRef.current;
    if (existing) {
      if (isPlaying) {
        existing.pause();
      } else {
        await play(existing);
      }
      return;
    }

    // Neu generieren
    setStatus("loading");
    setErrorMsg(null);
    setErrorNeedsSettings(false);

    const cacheKey = hashText(`steuerstoff-default\n${trimmed}`);

    const cached = getCachedAudioUrl(cacheKey);
    if (cached) {
      setStatus("ready");
      const el = attachAudio(cached);
      await play(el);
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const blob = await requestElevenLabsAudio({ text: trimmed }, abortController.signal);
      const url = URL.createObjectURL(blob);
      setCachedAudioUrl(cacheKey, url);
      setStatus("ready");
      const el = attachAudio(url);
      await play(el);
    } catch (error) {
      if (isTtsAbortError(error)) return;
      setStatus("error");
      setErrorNeedsSettings(ttsErrorNeedsSettings(error));
      setErrorMsg(ttsErrorMessage(error));
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [attachAudio, isPlaying, isStreaming, play, trimmed]);

  const handleStop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  const changeSpeed = useCallback((next: Speed) => {
    setSpeed(next);
    const el = audioRef.current;
    if (el) el.playbackRate = next;
  }, []);

  const disabled = isStreaming || !trimmed;
  const isLoading = status === "loading";

  const baseBtn =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 touch-manipulation";
  const idle = `${baseBtn} text-muted-foreground hover:bg-accent hover:text-foreground`;
  const active = `${baseBtn} text-foreground bg-accent/60 ring-1 ring-cyan-400/50 dark:ring-cyan-500/50`;

  let Icon = Volume2;
  let label = "Anhören";
  let aria = "Antwort anhören";
  if (isLoading) {
    Icon = Loader2;
    label = "Lädt";
    aria = "Audio wird geladen";
  } else if (isPlaying) {
    Icon = Pause;
    label = "Pause";
    aria = "Wiedergabe pausieren";
  } else if (audioRef.current) {
    Icon = Play;
    label = "Fortsetzen";
    aria = "Wiedergabe fortsetzen";
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1 mt-1"
      role="group"
      aria-label="Audio-Wiedergabe"
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        aria-label={aria}
        aria-pressed={isPlaying}
        className={isPlaying || audioRef.current ? active : idle}
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <Icon className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        <span>{label}</span>
      </button>

      {(isPlaying || (audioRef.current && !isPlaying && status !== "error")) && (
        <>
          <button
            type="button"
            onClick={handleStop}
            aria-label="Wiedergabe beenden"
            className={`${idle} ml-0.5`}
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <Square className="h-3 w-3" aria-hidden="true" />
            <span>Beenden</span>
          </button>

          <div
            role="group"
            aria-label="Wiedergabegeschwindigkeit"
            className="ml-1 inline-flex items-center gap-0.5"
          >
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSpeed(s)}
                aria-pressed={speed === s}
                className={`rounded-md px-1.5 py-1 text-[10px] font-medium transition-colors touch-manipulation ${
                  speed === s
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                style={{ minHeight: 32 }}
              >
                {s.toString().replace(".", ",")}×
              </button>
            ))}
          </div>
        </>
      )}

      {status === "error" && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1 text-[11px] text-destructive">
          <span className="inline-flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            <span className="max-w-[280px]" title={errorMsg ?? undefined}>
              {errorMsg ?? "Audio-Fehler."}
            </span>
          </span>
          {errorNeedsSettings && (
            <Link to="/einstellungen" className="font-semibold underline underline-offset-2">
              Zu den Einstellungen
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
