/**
 * ArticleAudioPlayer.tsx – Playlist-Player für segmentierte Magazin-Audios (v3)
 *
 * Lädt beim ersten Play ein Manifest von /api/tts?manifest=1 und spielt die
 * einzelnen kleinen MP3-Segmente nacheinander ab. Segment 0 startet, sobald
 * es bereit ist; Segment N+1 wird währenddessen vorgeladen. Global sind
 * Play/Pause, Speed, Mute, ±15 s, Fortschritt und Position.
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
import { onAudioStop, requestStopAllAudio } from "@/lib/chatTtsClient";
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

type Manifest = {
  version: string;
  articleId: string;
  segmentCount: number;
  estimatedDurationSeconds: number;
  segments: { index: number; url: string; chars: number; estimatedSeconds: number }[];
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
  const sourceId = `magazine-article:${articleId}`;
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [durations, setDurations] = useState<number[]>([]); // realer Wert je Segment
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentTime, setSegmentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speed, setSpeed] = useState<Speed>(1);
  const [muted, setMuted] = useState(false);
  const [browserFallbackActive, setBrowserFallbackActive] = useState(false);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const retriedRef = useRef<Set<number>>(new Set());
  const restoredRef = useRef(false);

  const manifestUrl = useMemo(
    () =>
      `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(
        AUDIO_CONTENT_VERSION,
      )}&manifest=1`,
    [articleId],
  );

  // Geschätzte / reale Segmentdauern
  const segmentDurations = useMemo(() => {
    if (!manifest) return [] as number[];
    return manifest.segments.map((s, i) => durations[i] ?? s.estimatedSeconds);
  }, [manifest, durations]);

  const totalDuration = useMemo(
    () => segmentDurations.reduce((a, b) => a + b, 0),
    [segmentDurations],
  );

  const globalTime = useMemo(() => {
    let t = 0;
    for (let i = 0; i < segmentIndex; i++) t += segmentDurations[i] ?? 0;
    return t + segmentTime;
  }, [segmentDurations, segmentIndex, segmentTime]);

  const allDurationsKnown = manifest ? durations.length === manifest.segmentCount && durations.every((d) => Number.isFinite(d)) : false;

  const disposeAudio = useCallback((ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    const el = ref.current;
    if (el) {
      el.pause();
      el.onended = null;
      el.onerror = null;
      el.ontimeupdate = null;
      el.onloadedmetadata = null;
      el.removeAttribute("src");
      el.load();
    }
    ref.current = null;
  }, []);

  const stopBrowserSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setBrowserFallbackActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopBrowserSpeech();
      disposeAudio(currentAudioRef);
      disposeAudio(preloadAudioRef);
    };
  }, [disposeAudio, stopBrowserSpeech]);

  useEffect(() => {
    return onAudioStop((source) => {
      if (source === sourceId) return;
      stopBrowserSpeech();
      const el = currentAudioRef.current;
      if (el && !el.paused) el.pause();
    });
  }, [sourceId, stopBrowserSpeech]);

  const savePosition = useCallback(
    (globalSec: number) => {
      try {
        localStorage.setItem(positionKey(articleId), String(globalSec));
      } catch {
        /* ignore */
      }
    },
    [articleId],
  );

  const clearPosition = useCallback(() => {
    try {
      localStorage.removeItem(positionKey(articleId));
    } catch {
      /* ignore */
    }
  }, [articleId]);

  const loadManifest = useCallback(async (): Promise<Manifest | null> => {
    try {
      const res = await fetch(manifestUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Manifest ${res.status}`);
      const data = (await res.json()) as Manifest;
      if (!data.segments || data.segments.length === 0) throw new Error("Leeres Manifest");
      setManifest(data);
      setDurations(new Array(data.segmentCount).fill(NaN));
      return data;
    } catch (e) {
      console.error("[magazine-audio] manifest error", e);
      setStatus("error");
      setErrorMsg("Audio-Manifest konnte nicht geladen werden.");
      return null;
    }
  }, [manifestUrl]);

  const createSegmentAudio = useCallback(
    (url: string, index: number, cacheBust = false): HTMLAudioElement => {
      const el = new Audio();
      el.preload = "auto";
      el.playsInline = true;
      el.crossOrigin = "anonymous";
      el.playbackRate = speed;
      el.muted = muted;
      el.src = cacheBust ? `${url}${url.includes("?") ? "&" : "?"}cb=${Date.now()}` : url;
      el.onloadedmetadata = () => {
        if (Number.isFinite(el.duration)) {
          setDurations((prev) => {
            const next = prev.slice();
            next[index] = el.duration;
            return next;
          });
        }
      };
      return el;
    },
    [muted, speed],
  );

  const preloadNext = useCallback(
    (nextIndex: number, m: Manifest) => {
      disposeAudio(preloadAudioRef);
      if (nextIndex >= m.segmentCount) return;
      const el = createSegmentAudio(m.segments[nextIndex].url, nextIndex);
      preloadAudioRef.current = el;
    },
    [createSegmentAudio, disposeAudio],
  );

  const playSegment = useCallback(
    async (index: number, m: Manifest, opts: { autoplay: boolean; startAt?: number }) => {
      if (index >= m.segmentCount) {
        // Ende
        setIsPlaying(false);
        setSegmentIndex(Math.max(0, m.segmentCount - 1));
        clearPosition();
        return;
      }

      // Aktuelles Segment entsorgen, Preload ggf. übernehmen
      disposeAudio(currentAudioRef);
      let el: HTMLAudioElement | null = null;
      const preloaded = preloadAudioRef.current;
      if (preloaded && preloaded.src.includes(m.segments[index].url)) {
        el = preloaded;
        preloadAudioRef.current = null;
      } else {
        disposeAudio(preloadAudioRef);
        el = createSegmentAudio(m.segments[index].url, index);
      }
      currentAudioRef.current = el;

      el.playbackRate = speed;
      el.muted = muted;

      el.ontimeupdate = () => {
        setSegmentTime(el!.currentTime);
        if (Math.floor(el!.currentTime) % 3 === 0) {
          let t = 0;
          for (let i = 0; i < index; i++) t += segmentDurations[i] ?? 0;
          savePosition(t + el!.currentTime);
        }
      };
      el.onended = () => {
        void playSegment(index + 1, m, { autoplay: true });
      };
      el.onerror = () => {
        if (!retriedRef.current.has(index)) {
          retriedRef.current.add(index);
          console.warn("[magazine-audio] segment error, retrying", index);
          disposeAudio(currentAudioRef);
          const retryEl = createSegmentAudio(m.segments[index].url, index, true);
          currentAudioRef.current = retryEl;
          retryEl.ontimeupdate = el!.ontimeupdate;
          retryEl.onended = el!.onended;
          retryEl.onerror = () => {
            setStatus("error");
            setErrorMsg(
              `Audioabschnitt ${index + 1} konnte nicht geladen werden. Sie können die Browserstimme als Ersatz nutzen.`,
            );
            setIsPlaying(false);
          };
          if (opts.autoplay) void retryEl.play().catch(() => undefined);
          return;
        }
        setStatus("error");
        setErrorMsg(
          `Audioabschnitt ${index + 1} konnte nicht geladen werden. Sie können die Browserstimme als Ersatz nutzen.`,
        );
        setIsPlaying(false);
      };
      el.onplay = () => setIsPlaying(true);
      el.onpause = () => setIsPlaying(false);

      setSegmentIndex(index);
      setSegmentTime(opts.startAt ?? 0);

      // Nächstes Segment vorbereiten
      preloadNext(index + 1, m);

      const startPlayback = async () => {
        try {
          if (opts.startAt && opts.startAt > 0) {
            el!.currentTime = opts.startAt;
          }
          if (opts.autoplay) {
            await el!.play();
          }
          setStatus("ready");
        } catch (e) {
          console.error("[magazine-audio] play error", e);
          setStatus("error");
          setErrorMsg("Wiedergabe konnte nicht gestartet werden.");
        }
      };

      if (el.readyState >= 2) {
        await startPlayback();
      } else {
        el.oncanplay = () => {
          el!.oncanplay = null;
          void startPlayback();
        };
      }
    },
    [
      clearPosition,
      createSegmentAudio,
      disposeAudio,
      muted,
      preloadNext,
      savePosition,
      segmentDurations,
      speed,
    ],
  );

  const handlePlayPause = useCallback(async () => {
    // Bereits laufend: pausieren
    if (isPlaying) {
      currentAudioRef.current?.pause();
      return;
    }
    requestStopAllAudio(sourceId);
    stopBrowserSpeech();

    let m = manifest;
    if (!m) {
      setStatus("loading");
      m = await loadManifest();
      if (!m) return;
    }

    // Bestehendes Segment: einfach fortsetzen
    if (currentAudioRef.current) {
      try {
        await currentAudioRef.current.play();
        setStatus("ready");
      } catch {
        setStatus("error");
        setErrorMsg("Wiedergabe konnte nicht gestartet werden.");
      }
      return;
    }

    // Position wiederherstellen
    let startIndex = 0;
    let startAt = 0;
    if (!restoredRef.current) {
      restoredRef.current = true;
      try {
        const saved = Number(localStorage.getItem(positionKey(articleId)));
        if (Number.isFinite(saved) && saved > 2) {
          let acc = 0;
          for (let i = 0; i < m.segments.length; i++) {
            const dur = m.segments[i].estimatedSeconds;
            if (saved < acc + dur) {
              startIndex = i;
              startAt = Math.max(0, saved - acc);
              break;
            }
            acc += dur;
          }
        }
      } catch {
        /* ignore */
      }
    }

    setStatus("loading");
    await playSegment(startIndex, m, { autoplay: true, startAt });
  }, [articleId, isPlaying, loadManifest, manifest, playSegment, sourceId, stopBrowserSpeech]);

  const seekTo = useCallback(
    (globalSec: number) => {
      if (!manifest) return;
      let acc = 0;
      for (let i = 0; i < manifest.segments.length; i++) {
        const dur = segmentDurations[i] ?? manifest.segments[i].estimatedSeconds;
        if (globalSec < acc + dur || i === manifest.segments.length - 1) {
          const localAt = Math.max(0, Math.min(dur, globalSec - acc));
          if (i === segmentIndex && currentAudioRef.current) {
            currentAudioRef.current.currentTime = localAt;
            setSegmentTime(localAt);
          } else {
            void playSegment(i, manifest, { autoplay: isPlaying, startAt: localAt });
          }
          return;
        }
        acc += dur;
      }
    },
    [isPlaying, manifest, playSegment, segmentDurations, segmentIndex],
  );

  const seekBy = useCallback(
    (delta: number) => {
      seekTo(Math.max(0, Math.min(totalDuration, globalTime + delta)));
    },
    [globalTime, seekTo, totalDuration],
  );

  const changeSpeed = useCallback((next: Speed) => {
    setSpeed(next);
    if (currentAudioRef.current) currentAudioRef.current.playbackRate = next;
    if (preloadAudioRef.current) preloadAudioRef.current.playbackRate = next;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (currentAudioRef.current) currentAudioRef.current.muted = next;
      if (preloadAudioRef.current) preloadAudioRef.current.muted = next;
      return next;
    });
  }, []);

  const startBrowserFallback = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    requestStopAllAudio(sourceId);
    disposeAudio(currentAudioRef);
    disposeAudio(preloadAudioRef);
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
  }, [browserSpeakContext, disposeAudio, sourceId]);

  const isLoading = status === "loading";
  const showPlayer = status !== "error" || isPlaying;
  const totalLabel = allDurationsKnown ? formatTime(totalDuration) : `ca. ${formatTime(totalDuration)}`;

  return (
    <section
      aria-label="Audiofassung des Fachbeitrags"
      className="mb-5 rounded-2xl border border-[#22d3ee]/25 bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#111a2e] p-4 text-[#f5efe1] shadow-[0_10px_40px_-20px_rgba(34,211,238,0.5)]"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#22d3ee]">
            Audiofassung · KI-generierte Stimme
          </div>
          <div className="mt-0.5 text-[12px] text-[#c8d3ea]">
            Fachbeitrag anhören – professionell vertont
            {manifest ? ` · Abschnitt ${segmentIndex + 1}/${manifest.segmentCount}` : ""}
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
          {errorMsg ?? "Die KI-Audiofassung konnte nicht geladen werden."}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-2 text-[12px] text-[#c8d3ea]" aria-live="polite">
          Audioabschnitt wird vorbereitet …
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
              onClick={() => seekBy(-15)}
              aria-label="15 Sekunden zurück"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => seekBy(15)}
              aria-label="15 Sekunden vor"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
              className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] tabular-nums text-[#c8d3ea]">
            <span className="w-10 text-right">{formatTime(globalTime)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(totalDuration, 0.1)}
              step={0.1}
              value={Math.min(globalTime, totalDuration || 0)}
              onChange={(e) => seekTo(Number(e.currentTarget.value))}
              aria-label="Wiedergabeposition"
              className="h-1.5 flex-1 appearance-none rounded-full bg-white/10 accent-[#22d3ee]"
            />
            <span className="w-14">{totalLabel}</span>
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
              onClick={browserFallbackActive ? stopBrowserSpeech : startBrowserFallback}
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
