/**
 * ArticleAudioPlayer.tsx – Dual-Mode-Player für Magazin-Audio (v3)
 *
 * Zwei Wiedergabemodi:
 *  - Nativ-HLS (Safari/iOS): EIN langlebiges HTMLAudioElement mit
 *    /api/tts?...&hls=1 als src. Safari lädt Segmente selbst nach,
 *    Wiedergabe läuft im Hintergrund/Lock-Screen weiter. Media Session
 *    API stellt Lock-Screen-Metadaten und -Aktionen bereit.
 *  - JavaScript-Playlist-Fallback (Chrome/Firefox ohne native HLS):
 *    Der bestehende v3-Segmentplayer. Segment N+1 wird während N
 *    vorgeladen. Manifest wird beim Mount still vorbereitet.
 */

import {
  Loader2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
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
  /**
   * Wenn gesetzt, wird ausschließlich dieser bereits normalisierte Text
   * an die Browser-Sprachausgabe übergeben. Titel/Untertitel/Lead/Body
   * werden dann für die Sprachausgabe ignoriert (bleiben aber für die
   * Media-Session-Anzeige erhalten).
   */
  speechOverride?: string;
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

/** Feature-Detection: native HLS-Unterstützung (Safari/iOS). */
function detectNativeHls(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const el = document.createElement("audio");
    const a = el.canPlayType("application/vnd.apple.mpegurl");
    const b = el.canPlayType("application/x-mpegURL");
    return !!(a || b);
  } catch {
    return false;
  }
}

/** Media Session – Metadaten & Action Handler defensiv setzen. */
function useMediaSession(
  active: boolean,
  title: string,
  subtitle: string | undefined,
  handlers: {
    play: () => void;
    pause: () => void;
    stop: () => void;
    seekBackward: () => void;
    seekForward: () => void;
    seekTo: (t: number) => void;
  },
) {
  useEffect(() => {
    if (!active) return;
    if (typeof navigator === "undefined") return;
    const ms = navigator.mediaSession;
    if (!ms || typeof window === "undefined" || typeof window.MediaMetadata !== "function") return;

    try {
      ms.metadata = new window.MediaMetadata({
        title,
        artist: "steuerstoff",
        album: "steuerstoff Magazin",
        artwork: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      });
    } catch {
      /* ignore */
    }

    const setAction = (name: MediaSessionAction, fn: (() => void) | ((d: MediaSessionActionDetails) => void) | null) => {
      try {
        ms.setActionHandler(name, fn as MediaSessionActionHandler | null);
      } catch {
        /* action nicht unterstützt */
      }
    };

    setAction("play", () => handlers.play());
    setAction("pause", () => handlers.pause());
    setAction("stop", () => handlers.stop());
    setAction("seekbackward", () => handlers.seekBackward());
    setAction("seekforward", () => handlers.seekForward());
    setAction("seekto", (d) => {
      const details = d as MediaSessionActionDetails;
      if (details && typeof details.seekTime === "number") handlers.seekTo(details.seekTime);
    });

    return () => {
      const actions: MediaSessionAction[] = [
        "play",
        "pause",
        "stop",
        "seekbackward",
        "seekforward",
        "seekto",
      ];
      for (const a of actions) {
        try {
          ms.setActionHandler(a, null);
        } catch {
          /* ignore */
        }
      }
      try {
        ms.metadata = null;
      } catch {
        /* ignore */
      }
      try {
        ms.playbackState = "none";
      } catch {
        /* ignore */
      }
    };
    // handlers absichtlich nicht als dep – wir nutzen aktuelle refs via closures aus handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, title, subtitle]);
}

function setPlaybackState(state: "playing" | "paused" | "none") {
  if (typeof navigator === "undefined" || !navigator.mediaSession) return;
  try {
    navigator.mediaSession.playbackState = state;
  } catch {
    /* ignore */
  }
}

function updatePositionState(audio: HTMLAudioElement) {
  if (typeof navigator === "undefined" || !navigator.mediaSession) return;
  const ms = navigator.mediaSession;
  if (typeof ms.setPositionState !== "function") return;
  const duration = audio.duration;
  const position = audio.currentTime;
  if (!Number.isFinite(duration) || duration <= 0) return;
  if (!Number.isFinite(position) || position < 0) return;
  try {
    ms.setPositionState({
      duration,
      position: Math.min(position, duration),
      playbackRate: audio.playbackRate || 1,
    });
  } catch {
    /* ignore */
  }
}

export function ArticleAudioPlayer({ articleId, browserSpeakContext }: Props) {
  const sourceId = `magazine-article:${articleId}`;

  // Feature-Detection einmalig client-seitig.
  const [nativeHls, setNativeHls] = useState<boolean>(false);
  useEffect(() => {
    setNativeHls(detectNativeHls());
  }, []);

  if (nativeHls) {
    return (
      <HlsPlayer
        articleId={articleId}
        sourceId={sourceId}
        browserSpeakContext={browserSpeakContext}
      />
    );
  }
  return (
    <PlaylistPlayer
      articleId={articleId}
      sourceId={sourceId}
      browserSpeakContext={browserSpeakContext}
    />
  );
}

// ---------------------------------------------------------------------------
// HLS-Modus (Safari / iOS)
// ---------------------------------------------------------------------------

function HlsPlayer({
  articleId,
  sourceId,
  browserSpeakContext,
}: {
  articleId: string;
  sourceId: string;
  browserSpeakContext: BrowserSpeakContext;
}) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(NaN);
  const [speed, setSpeed] = useState<Speed>(1);
  const [muted, setMuted] = useState(false);
  const [browserFallbackActive, setBrowserFallbackActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restoredRef = useRef(false);
  const reloadedRef = useRef(false);

  const hlsUrl = useMemo(
    () =>
      `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(
        AUDIO_CONTENT_VERSION,
      )}&hls=1`,
    [articleId],
  );
  const manifestUrl = useMemo(
    () =>
      `/api/tts?articleId=${encodeURIComponent(articleId)}&v=${encodeURIComponent(
        AUDIO_CONTENT_VERSION,
      )}&manifest=1`,
    [articleId],
  );

  // Manifest still im Hintergrund für Dauer-Schätzung laden (kein OpenAI-Call).
  useEffect(() => {
    let cancelled = false;
    void fetch(manifestUrl, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) setManifest(d as Manifest);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  const savePosition = useCallback(
    (t: number) => {
      try {
        localStorage.setItem(positionKey(articleId), String(t));
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

  const stopBrowserSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setBrowserFallbackActive(false);
  }, []);

  // Ein einziges Audio-Element für die gesamte Lebensdauer. Wird NICHT durch
  // Re-Renders neu erzeugt, NICHT durch visibilitychange gestoppt und
  // NICHT im Hintergrund entsorgt.
  useEffect(() => {
    const el = new Audio();
    el.preload = "metadata";
    el.setAttribute("playsinline", "");
    el.playbackRate = 1;
    el.src = hlsUrl;

    audioRef.current = el;

    let saveTick = 0;

    const onLoadedMeta = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
      // Fortsetzung nach Metadaten wiederherstellen.
      if (!restoredRef.current) {
        restoredRef.current = true;
        try {
          const saved = Number(localStorage.getItem(positionKey(articleId)));
          if (Number.isFinite(saved) && saved > 2 && Number.isFinite(el.duration) && saved < el.duration - 2) {
            try {
              el.currentTime = saved;
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* ignore */
        }
      }
    };
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime);
      updatePositionState(el);
      saveTick++;
      if (saveTick % 8 === 0) savePosition(el.currentTime);
    };
    const onDurationChange = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
    };
    const onPlay = () => {
      setIsPlaying(true);
      setStatus("ready");
      setPlaybackState("playing");
      updatePositionState(el);
    };
    const onPause = () => {
      setIsPlaying(false);
      setPlaybackState("paused");
      savePosition(el.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setPlaybackState("none");
      clearPosition();
    };
    const onError = () => {
      // Ein sauberer Reload-Versuch mit Cache-Buster
      if (!reloadedRef.current) {
        reloadedRef.current = true;
        console.warn("[magazine-audio-hls] error, reloading once");
        const wasPlaying = !el.paused;
        const t = el.currentTime;
        el.src = `${hlsUrl}&cb=${Date.now()}`;
        el.load();
        const resume = () => {
          try {
            if (Number.isFinite(t) && t > 0) el.currentTime = t;
          } catch {
            /* ignore */
          }
          if (wasPlaying) void el.play().catch(() => {});
          el.removeEventListener("loadedmetadata", resume);
        };
        el.addEventListener("loadedmetadata", resume);
        return;
      }
      setStatus("error");
      setErrorMsg(
        "Audio konnte nicht geladen werden. Sie können es erneut versuchen oder die Browserstimme nutzen.",
      );
      setIsPlaying(false);
      setPlaybackState("none");
    };

    el.addEventListener("loadedmetadata", onLoadedMeta);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("durationchange", onDurationChange);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    return () => {
      // Nur beim echten Unmount / Artikelwechsel entsorgen.
      el.removeEventListener("loadedmetadata", onLoadedMeta);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("durationchange", onDurationChange);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("error", onError);
      try {
        el.pause();
      } catch {
        /* ignore */
      }
      try {
        el.removeAttribute("src");
        el.load();
      } catch {
        /* ignore */
      }
      audioRef.current = null;
      setPlaybackState("none");
    };
  }, [articleId, clearPosition, hlsUrl, savePosition]);

  // Gegenseitige Audio-Stopp-Logik mit Chat-TTS.
  useEffect(() => {
    return onAudioStop((source) => {
      if (source === sourceId) return;
      stopBrowserSpeech();
      const el = audioRef.current;
      if (el && !el.paused) el.pause();
    });
  }, [sourceId, stopBrowserSpeech]);

  const handlePlayPause = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      return;
    }
    requestStopAllAudio(sourceId);
    stopBrowserSpeech();
    setErrorMsg(null);
    // Synchron im Klickpfad – keine awaits vor play().
    const p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch((e) => {
        console.error("[magazine-audio-hls] play error", e);
        setStatus("error");
        setErrorMsg("Wiedergabe konnte nicht gestartet werden. Bitte erneut tippen.");
      });
    }
  }, [isPlaying, sourceId, stopBrowserSpeech]);

  const seekBy = useCallback((delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    const total = Number.isFinite(el.duration) ? el.duration : 0;
    const target = Math.max(0, total ? Math.min(total, el.currentTime + delta) : el.currentTime + delta);
    try {
      el.currentTime = target;
    } catch {
      /* ignore */
    }
    updatePositionState(el);
  }, []);

  const seekTo = useCallback((t: number) => {
    const el = audioRef.current;
    if (!el) return;
    try {
      el.currentTime = Math.max(0, t);
    } catch {
      /* ignore */
    }
    updatePositionState(el);
  }, []);

  const restart = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    clearPosition();
    reloadedRef.current = false;
    try {
      el.currentTime = 0;
    } catch {
      /* ignore */
    }
    void el.play().catch(() => {});
  }, [clearPosition]);

  const retryAfterError = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    reloadedRef.current = false;
    setErrorMsg(null);
    setStatus("loading");
    el.src = `${hlsUrl}&cb=${Date.now()}`;
    el.load();
    void el.play().catch(() => {});
  }, [hlsUrl]);

  const changeSpeed = useCallback((next: Speed) => {
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  const startBrowserFallback = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    requestStopAllAudio(sourceId);
    const el = audioRef.current;
    if (el && !el.paused) el.pause();
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
  }, [browserSpeakContext, sourceId]);

  // Media Session – lokal in HLS-Modus, steuert dasselbe Audio-Element.
  useMediaSession(true, browserSpeakContext.title, browserSpeakContext.subtitle, {
    play: () => {
      const el = audioRef.current;
      if (!el) return;
      requestStopAllAudio(sourceId);
      void el.play().catch(() => {});
    },
    pause: () => audioRef.current?.pause(),
    stop: () => {
      const el = audioRef.current;
      if (!el) return;
      el.pause();
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
      clearPosition();
      setPlaybackState("none");
    },
    seekBackward: () => seekBy(-15),
    seekForward: () => seekBy(15),
    seekTo: (t: number) => seekTo(t),
  });

  const effectiveDuration = Number.isFinite(duration) && duration > 0
    ? duration
    : manifest?.estimatedDurationSeconds ?? 0;
  const totalLabel = Number.isFinite(duration) && duration > 0
    ? formatTime(duration)
    : manifest
    ? `ca. ${formatTime(manifest.estimatedDurationSeconds)}`
    : "–:––";

  const isLoading = status === "loading";

  return (
    <PlayerShell
      subtitle="Fachbeitrag anhören – professionell vertont"
      isPlaying={isPlaying}
      isLoading={isLoading}
      status={status}
      errorMsg={errorMsg}
      loadingText="Audio wird vorbereitet …"
      onPlayPause={handlePlayPause}
      onRestart={restart}
      onSeekBack={() => seekBy(-15)}
      onSeekForward={() => seekBy(15)}
      onRetry={retryAfterError}
      onBrowserFallback={startBrowserFallback}
      browserFallbackActive={browserFallbackActive}
      onStopBrowser={stopBrowserSpeech}
      currentTime={currentTime}
      totalDuration={effectiveDuration}
      totalLabel={totalLabel}
      canSeek={Number.isFinite(duration) && duration > 0}
      onSeekTo={seekTo}
      speed={speed}
      onChangeSpeed={changeSpeed}
      muted={muted}
      onToggleMute={toggleMute}
      backgroundHint="Läuft auch bei gesperrtem Bildschirm weiter"
    />
  );
}

// ---------------------------------------------------------------------------
// JavaScript-Playlist-Fallback (Chrome/Firefox ohne native HLS)
// ---------------------------------------------------------------------------

function PlaylistPlayer({
  articleId,
  sourceId,
  browserSpeakContext,
}: {
  articleId: string;
  sourceId: string;
  browserSpeakContext: BrowserSpeakContext;
}) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const manifestPromiseRef = useRef<Promise<Manifest | null> | null>(null);
  const [durations, setDurations] = useState<number[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [segmentTime, setSegmentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingClick, setPendingClick] = useState(false);
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

  const loadManifest = useCallback((): Promise<Manifest | null> => {
    if (manifestPromiseRef.current) return manifestPromiseRef.current;
    const p = (async () => {
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
        manifestPromiseRef.current = null;
        return null;
      }
    })();
    manifestPromiseRef.current = p;
    return p;
  }, [manifestUrl]);

  useEffect(() => {
    void loadManifest();
  }, [loadManifest]);

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

  const allDurationsKnown = manifest
    ? durations.length === manifest.segmentCount && durations.every((d) => Number.isFinite(d))
    : false;

  const disposeAudio = useCallback((ref: React.MutableRefObject<HTMLAudioElement | null>) => {
    const el = ref.current;
    if (el) {
      el.pause();
      el.onended = null;
      el.onerror = null;
      el.ontimeupdate = null;
      el.onloadedmetadata = null;
      el.oncanplay = null;
      el.onplay = null;
      el.onpause = null;
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

  const createSegmentAudio = useCallback(
    (url: string, index: number, cacheBust = false): HTMLAudioElement => {
      const el = new Audio();
      el.preload = "auto";
      el.setAttribute("playsinline", "");
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
      preloadAudioRef.current = createSegmentAudio(m.segments[nextIndex].url, nextIndex);
    },
    [createSegmentAudio, disposeAudio],
  );

  const playSegmentRef = useRef<
    ((index: number, m: Manifest, opts: { autoplay: boolean; startAt?: number }) => Promise<void>) | null
  >(null);

  const attachPlaybackHandlers = useCallback(
    (el: HTMLAudioElement, index: number, m: Manifest, autoplay: boolean) => {
      el.ontimeupdate = () => {
        setSegmentTime(el.currentTime);
        if (Math.floor(el.currentTime) % 3 === 0) {
          let t = 0;
          for (let i = 0; i < index; i++) t += segmentDurations[i] ?? 0;
          savePosition(t + el.currentTime);
        }
      };
      el.onended = () => {
        void playSegmentRef.current?.(index + 1, m, { autoplay: true });
      };
      el.onplay = () => setIsPlaying(true);
      el.onpause = () => setIsPlaying(false);
      el.onerror = () => {
        if (!retriedRef.current.has(index)) {
          retriedRef.current.add(index);
          console.warn("[magazine-audio] segment error, retrying", index);
          void playSegmentRef.current?.(index, m, { autoplay, startAt: 0 });
          return;
        }
        setStatus("error");
        setErrorMsg(
          `Audioabschnitt ${index + 1} konnte nicht geladen werden. Sie können es erneut versuchen oder die Browserstimme nutzen.`,
        );
        setIsPlaying(false);
      };
    },
    [savePosition, segmentDurations],
  );

  const playSegment = useCallback(
    async (index: number, m: Manifest, opts: { autoplay: boolean; startAt?: number }): Promise<void> => {
      if (index >= m.segmentCount) {
        setIsPlaying(false);
        setSegmentIndex(Math.max(0, m.segmentCount - 1));
        clearPosition();
        return;
      }
      const useCacheBust = retriedRef.current.has(index);
      disposeAudio(currentAudioRef);
      let el: HTMLAudioElement;
      const preloaded = preloadAudioRef.current;
      if (!useCacheBust && preloaded && preloaded.src.includes(m.segments[index].url)) {
        el = preloaded;
        preloadAudioRef.current = null;
      } else {
        disposeAudio(preloadAudioRef);
        el = createSegmentAudio(m.segments[index].url, index, useCacheBust);
      }
      currentAudioRef.current = el;
      el.playbackRate = speed;
      el.muted = muted;

      attachPlaybackHandlers(el, index, m, opts.autoplay);

      setSegmentIndex(index);
      setSegmentTime(opts.startAt ?? 0);

      preloadNext(index + 1, m);

      if (opts.startAt && opts.startAt > 0) {
        const applyStart = () => {
          try {
            el.currentTime = opts.startAt!;
          } catch {
            /* ignore */
          }
        };
        if (el.readyState >= 1) applyStart();
        else el.addEventListener("loadedmetadata", applyStart, { once: true });
      }

      if (opts.autoplay) {
        try {
          await el.play();
          setStatus("ready");
          setErrorMsg(null);
        } catch (e) {
          console.error("[magazine-audio] play error", e);
          setStatus("error");
          setErrorMsg("Wiedergabe konnte nicht gestartet werden. Bitte erneut tippen.");
        }
      } else {
        setStatus("ready");
      }
    },
    [
      attachPlaybackHandlers,
      clearPosition,
      createSegmentAudio,
      disposeAudio,
      muted,
      preloadNext,
      speed,
    ],
  );

  useEffect(() => {
    playSegmentRef.current = playSegment;
  }, [playSegment]);

  const resolveStartPosition = useCallback(
    (m: Manifest): { index: number; startAt: number } => {
      if (restoredRef.current) return { index: 0, startAt: 0 };
      restoredRef.current = true;
      try {
        const saved = Number(localStorage.getItem(positionKey(articleId)));
        if (Number.isFinite(saved) && saved > 2) {
          let acc = 0;
          for (let i = 0; i < m.segments.length; i++) {
            const dur = m.segments[i].estimatedSeconds;
            if (saved < acc + dur) return { index: i, startAt: Math.max(0, saved - acc) };
            acc += dur;
          }
        }
      } catch {
        /* ignore */
      }
      return { index: 0, startAt: 0 };
    },
    [articleId],
  );

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      currentAudioRef.current?.pause();
      return;
    }
    requestStopAllAudio(sourceId);
    stopBrowserSpeech();
    setErrorMsg(null);

    if (currentAudioRef.current) {
      currentAudioRef.current
        .play()
        .then(() => setStatus("ready"))
        .catch(() => {
          setStatus("error");
          setErrorMsg("Wiedergabe konnte nicht gestartet werden. Bitte erneut tippen.");
        });
      return;
    }
    if (manifest) {
      const { index, startAt } = resolveStartPosition(manifest);
      setStatus("loading");
      void playSegment(index, manifest, { autoplay: true, startAt });
      return;
    }
    setPendingClick(true);
    setStatus("loading");
    void loadManifest().then((m) => {
      setPendingClick(false);
      if (!m) {
        setStatus("error");
        setErrorMsg("Audio-Manifest konnte nicht geladen werden.");
      } else {
        setStatus("idle");
      }
    });
  }, [
    isPlaying,
    loadManifest,
    manifest,
    playSegment,
    resolveStartPosition,
    sourceId,
    stopBrowserSpeech,
  ]);

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

  const restart = useCallback(() => {
    if (!manifest) return;
    clearPosition();
    retriedRef.current.clear();
    void playSegment(0, manifest, { autoplay: isPlaying, startAt: 0 });
  }, [clearPosition, isPlaying, manifest, playSegment]);

  const retryAfterError = useCallback(() => {
    if (!manifest) {
      void loadManifest();
      return;
    }
    retriedRef.current.clear();
    setErrorMsg(null);
    setStatus("loading");
    void playSegment(segmentIndex, manifest, { autoplay: true, startAt: segmentTime });
  }, [loadManifest, manifest, playSegment, segmentIndex, segmentTime]);

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
  const hasManifest = !!manifest;
  const totalLabel = !hasManifest
    ? "–:––"
    : allDurationsKnown
    ? formatTime(totalDuration)
    : `ca. ${formatTime(totalDuration)}`;

  return (
    <PlayerShell
      subtitle={`Fachbeitrag anhören – professionell vertont${
        manifest ? ` · Abschnitt ${segmentIndex + 1}/${manifest.segmentCount}` : ""
      }`}
      isPlaying={isPlaying}
      isLoading={isLoading}
      status={status}
      errorMsg={errorMsg}
      loadingText={
        pendingClick
          ? "Audio wird vorbereitet … Bitte gleich noch einmal tippen."
          : "Audioabschnitt wird vorbereitet …"
      }
      onPlayPause={handlePlayPause}
      onRestart={restart}
      onSeekBack={() => seekBy(-15)}
      onSeekForward={() => seekBy(15)}
      onRetry={retryAfterError}
      onBrowserFallback={startBrowserFallback}
      browserFallbackActive={browserFallbackActive}
      onStopBrowser={stopBrowserSpeech}
      currentTime={globalTime}
      totalDuration={totalDuration}
      totalLabel={totalLabel}
      canSeek={hasManifest}
      onSeekTo={seekTo}
      speed={speed}
      onChangeSpeed={changeSpeed}
      muted={muted}
      onToggleMute={toggleMute}
      backgroundHint={null}
    />
  );
}

// ---------------------------------------------------------------------------
// Gemeinsame UI-Hülle
// ---------------------------------------------------------------------------

function PlayerShell(props: {
  subtitle: string;
  isPlaying: boolean;
  isLoading: boolean;
  status: "idle" | "loading" | "ready" | "error";
  errorMsg: string | null;
  loadingText: string;
  onPlayPause: () => void;
  onRestart: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onRetry: () => void;
  onBrowserFallback: () => void;
  browserFallbackActive: boolean;
  onStopBrowser: () => void;
  currentTime: number;
  totalDuration: number;
  totalLabel: string;
  canSeek: boolean;
  onSeekTo: (t: number) => void;
  speed: Speed;
  onChangeSpeed: (s: Speed) => void;
  muted: boolean;
  onToggleMute: () => void;
  backgroundHint: string | null;
}) {
  const {
    subtitle,
    isPlaying,
    isLoading,
    status,
    errorMsg,
    loadingText,
    onPlayPause,
    onRestart,
    onSeekBack,
    onSeekForward,
    onRetry,
    onBrowserFallback,
    browserFallbackActive,
    onStopBrowser,
    currentTime,
    totalDuration,
    totalLabel,
    canSeek,
    onSeekTo,
    speed,
    onChangeSpeed,
    muted,
    onToggleMute,
    backgroundHint,
  } = props;

  const showPlayer = status !== "error" || isPlaying;

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
          <div className="mt-0.5 text-[12px] text-[#c8d3ea]">{subtitle}</div>
          {backgroundHint ? (
            <div className="mt-0.5 text-[11px] text-[#a7b6d6]">{backgroundHint}</div>
          ) : null}
        </div>
        {status === "error" ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full border border-[#22d3ee]/40 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#f5efe1] transition hover:bg-white/10"
            >
              Erneut versuchen
            </button>
            <button
              type="button"
              onClick={onBrowserFallback}
              className="rounded-full border border-[#22d3ee]/40 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-[#f5efe1] transition hover:bg-white/10"
            >
              Browserstimme verwenden
            </button>
          </div>
        ) : null}
      </div>

      {status === "error" ? (
        <p className="mt-2 text-[12px] text-[#fca5a5]" role="alert">
          {errorMsg ?? "Die KI-Audiofassung konnte nicht geladen werden."}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-2 text-[12px] text-[#c8d3ea]" aria-live="polite">
          {loadingText}
        </p>
      ) : null}

      {showPlayer ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPlayPause}
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
              onClick={onRestart}
              aria-label="Von vorn beginnen"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <SkipBack className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSeekBack}
              aria-label="15 Sekunden zurück"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onSeekForward}
              aria-label="15 Sekunden vor"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[#f5efe1] transition hover:bg-white/10"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
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
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(totalDuration, 0.1)}
              step={0.1}
              value={Math.min(currentTime, totalDuration || 0)}
              onChange={(e) => onSeekTo(Number(e.currentTarget.value))}
              aria-label="Wiedergabeposition"
              disabled={!canSeek}
              className="h-1.5 flex-1 appearance-none rounded-full bg-white/10 accent-[#22d3ee] disabled:opacity-50"
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
                  onClick={() => onChangeSpeed(opt)}
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
              onClick={browserFallbackActive ? onStopBrowser : onBrowserFallback}
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
