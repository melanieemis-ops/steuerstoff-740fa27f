import { Loader2, Pause, Play, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  pauseBrowserSpeech,
  resumeBrowserSpeech,
  speakWithBrowser,
  stopBrowserSpeech,
} from "@/lib/browserSpeech";
import { loadSpeechSettings } from "@/lib/speech-storage";
import { isTtsAbortError, requestSpeechAudio } from "@/lib/textToSpeechService";

interface SimpleReadAloudButtonProps {
  text: string;
  label?: string;
  className?: string;
}

type Mode = "idle" | "loading" | "audio" | "browser" | "paused";

export function SimpleReadAloudButton({ text, label = "Anhören", className = "" }: SimpleReadAloudButtonProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const browserModeRef = useRef(false);

  function cleanupAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    cleanupAudio();
    stopBrowserSpeech();
    browserModeRef.current = false;
    setMode("idle");
  }

  useEffect(() => stop, []);

  async function start() {
    const prepared = text.trim();
    if (!prepared) return;
    setError(null);
    setMode("loading");
    const settings = loadSpeechSettings();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const blob = await requestSpeechAudio({ text: prepared }, controller.signal);
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audio.playbackRate = settings.rate ?? 1;
      audio.onplay = () => setMode("audio");
      audio.onpause = () => !audio.ended && setMode("paused");
      audio.onended = () => { cleanupAudio(); setMode("idle"); };
      audio.onerror = () => { cleanupAudio(); setError("Die Audiodatei konnte nicht abgespielt werden."); setMode("idle"); };
      audioRef.current = audio;
      await audio.play();
    } catch (reason) {
      if (isTtsAbortError(reason)) return;
      if (settings.allowBrowserFallback !== false) {
        try {
          browserModeRef.current = true;
          speakWithBrowser(prepared, settings, {
            onStart: () => setMode("browser"),
            onEnd: () => { browserModeRef.current = false; setMode("idle"); },
            onError: (message) => { browserModeRef.current = false; setError(message); setMode("idle"); },
          });
          return;
        } catch {
          // show common error below
        }
      }
      setError("Die Stimme ist gerade nicht verfügbar.");
      setMode("idle");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }

  function togglePause() {
    if (browserModeRef.current) {
      if (mode === "paused") {
        resumeBrowserSpeech();
        setMode("browser");
      } else {
        pauseBrowserSpeech();
        setMode("paused");
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play(); else audio.pause();
  }

  const playing = mode === "audio" || mode === "browser";
  const paused = mode === "paused";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {mode === "idle" || mode === "loading" ? (
        <button type="button" onClick={() => void start()} disabled={mode === "loading" || !text.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-50">
          {mode === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
          {mode === "loading" ? "Stimme wird vorbereitet …" : label}
        </button>
      ) : (
        <>
          <button type="button" onClick={togglePause} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground px-3 py-2 text-sm font-semibold text-background">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {paused ? "Weiter" : "Pause"}
          </button>
          <button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold">
            <Square className="h-4 w-4" /> Beenden
          </button>
        </>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
