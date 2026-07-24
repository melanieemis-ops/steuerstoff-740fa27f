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
  pauseBrowserSpeech,
  resumeBrowserSpeech,
  speakWithBrowser,
  stopBrowserSpeech,
} from "@/lib/browserSpeech";
import { loadSpeechSettings, saveSpeechSettings } from "@/lib/speech-storage";
import {
  isTtsAbortError,
  requestSpeechAudio,
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

export function ChatMessageAudioButton({ messageId: _messageId, text, isStreaming = false }: Props) {
  const trimmed = text.trim();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const browserModeRef = useRef(false);
  const instanceId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<Speed>(() => {
    const rate = loadSpeechSettings().rate;
    return SPEEDS.includes(rate as Speed) ? (rate as Speed) : 1;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorNeedsSettings, setErrorNeedsSettings] = useState(false);

  const stopThisAudio = useCallback(() => {
    audioRef.current?.pause();
    stopBrowserSpeech();
    browserModeRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  useEffect(() => onAudioStop((source) => {
    if (source !== instanceId) stopThisAudio();
  }), [instanceId, stopThisAudio]);

  useEffect(() => () => {
    abortControllerRef.current?.abort();
    audioRef.current?.pause();
    stopBrowserSpeech();
  }, []);

  const attachAudio = useCallback((url: string) => {
    const el = new Audio(url);
    el.preload = "auto";
    el.playbackRate = speed;
    el.addEventListener("play", () => { setIsPlaying(true); setIsPaused(false); });
    el.addEventListener("pause", () => { if (!el.ended) { setIsPlaying(false); setIsPaused(true); } });
    el.addEventListener("ended", () => { setIsPlaying(false); setIsPaused(false); });
    el.addEventListener("error", () => {
      setStatus("error");
      setErrorMsg("Wiedergabe fehlgeschlagen.");
      setIsPlaying(false);
      setIsPaused(false);
    });
    audioRef.current = el;
    return el;
  }, [speed]);

  const play = useCallback(async (el: HTMLAudioElement) => {
    requestStopAllAudio(instanceId);
    try { await el.play(); } catch {
      setStatus("error");
      setErrorMsg("Wiedergabe konnte nicht gestartet werden.");
    }
  }, [instanceId]);

  const startBrowserFallback = useCallback(() => {
    const settings = { ...loadSpeechSettings(), rate: speed };
    requestStopAllAudio(instanceId);
    browserModeRef.current = true;
    speakWithBrowser(trimmed, settings, {
      onStart: () => { setStatus("ready"); setIsPlaying(true); setIsPaused(false); setErrorMsg(null); },
      onEnd: () => { browserModeRef.current = false; setIsPlaying(false); setIsPaused(false); },
      onError: (message) => { browserModeRef.current = false; setStatus("error"); setErrorMsg(message); },
    });
  }, [instanceId, speed, trimmed]);

  const handleClick = useCallback(async () => {
    if (isStreaming || !trimmed) return;

    if (browserModeRef.current) {
      if (isPlaying) {
        pauseBrowserSpeech();
        setIsPlaying(false);
        setIsPaused(true);
      } else {
        resumeBrowserSpeech();
        setIsPlaying(true);
        setIsPaused(false);
      }
      return;
    }

    const existing = audioRef.current;
    if (existing) {
      if (isPlaying) existing.pause(); else await play(existing);
      return;
    }

    setStatus("loading");
    setErrorMsg(null);
    setErrorNeedsSettings(false);
    const settings = loadSpeechSettings();
    const cacheKey = hashText(`${settings.provider}:${settings.openAiVoice}:${trimmed}`);
    const cached = getCachedAudioUrl(cacheKey);
    if (cached) {
      setStatus("ready");
      await play(attachAudio(cached));
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    try {
      const blob = await requestSpeechAudio({ text: trimmed }, abortController.signal);
      const url = URL.createObjectURL(blob);
      setCachedAudioUrl(cacheKey, url);
      setStatus("ready");
      await play(attachAudio(url));
    } catch (error) {
      if (isTtsAbortError(error)) return;
      if (settings.allowBrowserFallback !== false) {
        try {
          startBrowserFallback();
          return;
        } catch {
          // fall through to the normal error state
        }
      }
      setStatus("error");
      setErrorNeedsSettings(ttsErrorNeedsSettings(error));
      setErrorMsg(ttsErrorMessage(error));
    } finally {
      if (abortControllerRef.current === abortController) abortControllerRef.current = null;
    }
  }, [attachAudio, isPlaying, isStreaming, play, startBrowserFallback, trimmed]);

  const handleStop = useCallback(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; }
    stopBrowserSpeech();
    browserModeRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const changeSpeed = useCallback((next: Speed) => {
    setSpeed(next);
    saveSpeechSettings({
      ...loadSpeechSettings(),
      rate: next,
    });

    const el = audioRef.current;
    if (el) el.playbackRate = next;
  }, []);

  const disabled = isStreaming || !trimmed;
  const isLoading = status === "loading";
  const hasPlayback = Boolean(audioRef.current) || browserModeRef.current || isPaused;
  const baseBtn = "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 touch-manipulation";
  const idle = `${baseBtn} text-muted-foreground hover:bg-accent hover:text-foreground`;
  const active = `${baseBtn} text-foreground bg-accent/60 ring-1 ring-cyan-400/50 dark:ring-cyan-500/50`;

  let Icon = Volume2;
  let label = "Anhören";
  let aria = "Antwort anhören";
  if (isLoading) { Icon = Loader2; label = "Lädt"; aria = "Audio wird geladen"; }
  else if (isPlaying) { Icon = Pause; label = "Pause"; aria = "Wiedergabe pausieren"; }
  else if (hasPlayback) { Icon = Play; label = "Fortsetzen"; aria = "Wiedergabe fortsetzen"; }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1" role="group" aria-label="Audio-Wiedergabe">
      <button type="button" onClick={() => void handleClick()} disabled={disabled || isLoading} aria-label={aria} aria-pressed={isPlaying} className={isPlaying || hasPlayback ? active : idle} style={{ minHeight: 44, minWidth: 44 }}>
        <Icon className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        <span>{label}</span>
      </button>

      {hasPlayback && status !== "error" && (
        <button type="button" onClick={handleStop} aria-label="Wiedergabe beenden" className={`${idle} ml-0.5`} style={{ minHeight: 44, minWidth: 44 }}>
          <Square className="h-3 w-3" aria-hidden="true" /><span>Beenden</span>
        </button>
      )}

      <div role="group" aria-label="Wiedergabegeschwindigkeit" className="ml-1 inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-background/40 p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => changeSpeed(s)}
            aria-label={`Wiedergabegeschwindigkeit ${s.toString().replace(".", ",")} fach`}
            aria-pressed={speed === s}
            className={`min-h-8 rounded-md px-2 text-[10px] font-semibold transition-colors touch-manipulation ${
              speed === s
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {s.toString().replace(".", ",")}×
          </button>
        ))}
      </div>

      {status === "error" && (
        <div className="flex flex-wrap items-center gap-1.5 pl-1 text-[11px] text-destructive">
          <span className="inline-flex items-center gap-1.5"><AlertCircle className="h-3 w-3" /><span className="max-w-[280px]">{errorMsg ?? "Audio-Fehler."}</span></span>
          {errorNeedsSettings && <Link to="/einstellungen" className="font-semibold underline underline-offset-2">Zu den Einstellungen</Link>}
        </div>
      )}
    </div>
  );
}
