/**
 * ArticleAudioPlayer.tsx
 *
 * Hochwertiger Audio-Player für den steuerstoff-Spezialbeitrag.
 * - Nutzt /api/tts mit whitelisted articleId + fester Inhaltsversion.
 * - Speichert Wiedergabeposition pro Artikel in localStorage.
 * - Bietet Browserstimme-Fallback, wenn OpenAI-TTS nicht liefert.
 * - Sorgt dafür, dass Browserstimme und Audio nie parallel laufen.
 */

import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AUDIO_CONTENT_VERSION } from "@/lib/articleSpeechText";
import { onAudioStop } from "@/lib/chatTtsClient";
import { normalizeForSpeech } from "@/lib/speech-normalize";

type BrowserSpeakContext = {
  title: string;
  subtitle?: string;
  lead: string;
  bodyText: string;
};

type Props = {
  articleId: string;
  browserSpeakContext: BrowserSpeakContext;
};

const SPEED_OPTIONS = [0.8, 1, 1.25, 1.5, 2] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function positionKey(articleId: string) {
  return `steuerstoff-audio-pos-${articleId}-v${AUDIO_CONTENT_VERSION}`;
}

export function ArticleAudioPlayer({ articleId, browserSpeakContext }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [muted, setMuted] = useState(false);
  const [browserFallbackActive, setBrowserFallbackActive] = useState(false);

  const audioSrc = useMemo(
    () =>
      `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(
        AUDIO_CONTENT_VERSION,
      )}`,
    [articleId],
  );

  // Wiedergabeposition wiederherstellen
  const restoredRef = useRef(false);
  useEffect(() => {
    restoredRef.current = false;
  }, [articleId]);

  const stopBrowserSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setBrowserFallbackActive(false);
  }, []);

  const cleanupAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    setIsPlaying(false);
  }, []);

  // Beim Unmount alles freigeben
  useEffect(() => {
    return () => {
      stopBrowserSpeech();
      const el = audioRef.current;
      if (el) {
        el.pause();
      }
    };
  }, [stopBrowserSpeech]);

  // Wenn eine andere Audio-Ausgabe startet (z. B. Chat-Vorlesen), diese pausieren.
  useEffect(() => {
    return onAudioStop(() => {
      stopBrowserSpeech();
      const el = audioRef.current;
      if (el && !el.paused) el.pause();
    });
  }, [stopBrowserSpeech]);

  const ensureLoaded = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = "none";
    el.src = audioSrc;
    el.playbackRate = speed;
    el.muted = muted;
    el.addEventListener("loadedmetadata", () => {
      setDuration(el.duration || 0);
      if (!restoredRef.current) {
        restoredRef.current = true;
        try {
          const saved = Number(localStorage.getItem(positionKey(articleId)));
          if (Number.isFinite(saved) && saved > 2 && el.duration && saved < el.duration - 2) {
            el.currentTime = saved;
          }
        } catch {
          /* ignore */
        }
      }
      setStatus("ready");
    });
    el.addEventListener("timeupdate", () => {
      setCurrent(el.currentTime);
      // Position sparsam persistieren
      if (Math.floor(el.currentTime) % 3 === 0) {
        try {
          localStorage.setItem(positionKey(articleId), String(el.currentTime));
        } catch {
          /* ignore */
        }
      }
    });
    el.addEventListener("play", () => setIsPlaying(true));
    el.addEventListener("pause", () => setIsPlaying(false));
    el.addEventListener("ended", () => {
      setIsPlaying(false);
      try {
        localStorage.removeItem(positionKey(articleId));
      } catch {
        /* ignore */
      }
    });
    el.addEventListener("error", () => {
      setStatus("error");
      setErrorMsg("Audio konnte nicht geladen werden.");
      setIsPlaying(false);
    });
    audioRef.current = el;
    return el;
  }, [articleId, audioSrc, muted, speed]);

  const handlePlayPause = useCallback(async () => {
    stopBrowserSpeech();
    const el = ensureLoaded();
    if (isPlaying) {
      el.pause();
      return;
    }
    try {
      if (status === "idle") {
        setStatus("loading");
        el.load();
      }
      await el.play();
    } catch {
      setStatus("error");
      setErrorMsg("Wiedergabe konnte nicht gestartet werden.");
    }
  }, [ensureLoaded, isPlaying, status, stopBrowserSpeech]);

  const seekBy = useCallback(
    (delta: number) => {
      const el = audioRef.current;
      if (!el || !Number.isFinite(el.duration)) return;
      el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + delta));
    },
    [],
  );

  const seekTo = useCallback((value: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = value;
    setCurrent(value);
  }, []);

  const changeSpeed = useCallback((next: Speed) => {
    setSpeed(next);
    const el = audioRef.current;
    if (el) el.playbackRate = next;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const el = audioRef.current;
      const next = !prev;
      if (el) el.muted = next;
      return next;
    });
  }, []);

  const startBrowserFallback = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    cleanupAudio();
    const synth = window.speechSynthesis;
    synth.cancel();
    const parts = [
      browserSpeakContext.title,
      browserSpeakContext.subtitle ?? "",
      browserSpeakContext.lead,
      browserSpeakContext.bodyText,
    ];
    const full = normalizeForSpeech(parts.filter(Boolean).join(". "));
    const chunks = full.match(/[^.!?]+[.!?]+|\S[^.!?]*$/g) ?? [full];
    setBrowserFallbackActive(true);
    chunks.forEach((c, idx) => {
      const u = new SpeechSynthesisUtterance(c.trim());
      u.lang = "de-DE";
      u.rate = 1;
      if (idx === chunks.length - 1) {
        u.onend = () => setBrowserFallbackActive(false);
      }
      synth.speak(u);
    });
  }, [browserSpeakContext, cleanupAudio]);

  const stopBrowserFallback = useCallback(() => {
    stopBrowserSpeech();
  }, [stopBrowserSpeech]);

  const isLoading = status === "loading";
  const showPlayer = status !== "error" || isPlaying;

  return (
    <section
      aria-label="Audiofassung des Fachbeitrags"
      className="mb-5 rounded-2xl border border-[#22d3ee]/25 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111a2e] p-4 text-[#f5efe1] shadow-[0_10px_40px_-20px_rgba(34,211,238,0.5)]"
      style={{
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#22d3ee]">
            Audiofassung · KI-generierte Stimme
          </div>
          <div className="mt-0.5 text-[12px] text-[#c8d3ea]">
            Fachbeitrag anhören – professionell vertont
          </div>
        </div>
        {status === "error" ? (
          <button
            type="button"
            onClick={startBrowserFallback}
            className="rounded-full border border-[#22d3ee]/40 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#f5efe1] transition hover:bg-white/10"
          >
            Browserstimme verwenden
          </button>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="mt-2 text-[12px] text-[#fca5a5]" role="alert">
          {errorMsg ?? "Audio konnte nicht erzeugt werden."}
        </p>
      ) : null}

      {showPlayer ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause" : "Fachbeitrag anhören"}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22d3ee] to-[#ec4899] text-[#0b1220] shadow-md transition active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              aria-label="10 Sekunden zurück"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCcw className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => seekBy(10)}
              aria-label="10 Sekunden vor"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCw className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              {muted ? (
                <VolumeX className="h-4.5 w-4.5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4.5 w-4.5" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] tabular-nums text-[#c8d3ea]">
            <span className="w-10 text-right">{formatTime(current)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(duration, 0.1)}
              step={0.1}
              value={Math.min(current, duration || 0)}
              onChange={(e) => seekTo(Number(e.currentTarget.value))}
              aria-label="Wiedergabeposition"
              className="h-1.5 flex-1 appearance-none rounded-full bg-white/10 accent-[#22d3ee]"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>

          <div
            role="group"
            aria-label="Wiedergabegeschwindigkeit"
            className="flex flex-wrap items-center gap-1.5"
          >
            {SPEED_OPTIONS.map((opt) => {
              const active = opt === speed;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => changeSpeed(opt)}
                  aria-pressed={active}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "bg-[#22d3ee] text-[#0b1220]"
                      : "bg-white/5 text-[#c8d3ea] hover:bg-white/10"
                  }`}
                >
                  {opt.toString().replace(".", ",")}×
                </button>
              );
            })}
            <button
              type="button"
              onClick={browserFallbackActive ? stopBrowserFallback : startBrowserFallback}
              className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#c8d3ea] transition hover:bg-white/10"
            >
              {browserFallbackActive ? "Browserstimme stoppen" : "Browserstimme"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
