import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  AlertCircle,
} from "lucide-react";
import type { ReactNode } from "react";

import type { useTextToSpeech } from "@/hooks/useTextToSpeech";

type TextToSpeechApi = ReturnType<typeof useTextToSpeech>;

interface TextToSpeechControlsProps {
  tts: TextToSpeechApi;
  hidden?: boolean;
}

export function TextToSpeechControls({ tts, hidden = false }: TextToSpeechControlsProps) {
  if (hidden || !tts.isSupported || !tts.hasSession) {
    return null;
  }

  const statusLabel = tts.isLoading
    ? "Audio wird vorbereitet ..."
    : tts.isSpeaking
    ? "Wird vorgelesen"
    : tts.isPaused
      ? "Pausiert"
      : tts.status === "ended"
        ? "Vorlesen beendet"
        : tts.status === "error"
          ? "Fehler bei der Sprachausgabe"
        : "Bereit";

  const mmss = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return `${minutes}:${rest.toString().padStart(2, "0")}`;
  };

  return (
    <section
      role="region"
      aria-label="Vorlese-Steuerung"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+68px)] left-1/2 z-40 w-[min(960px,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-slate-900/95 px-3 py-3 text-slate-100 shadow-xl backdrop-blur sm:bottom-6 sm:px-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
          {statusLabel}
        </span>

        <span aria-live="polite" className="text-xs text-slate-200">
          {tts.currentSectionIndex >= 0 && tts.totalSections > 0
            ? `Abschnitt ${tts.currentSectionIndex + 1} von ${tts.totalSections}`
            : ""}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ControlButton
          label="Pause"
          ariaLabel="Vorlesen pausieren"
          onClick={tts.pause}
          disabled={!tts.isSpeaking || tts.isLoading}
          icon={<Pause className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="Fortsetzen"
          ariaLabel="Vorlesen fortsetzen"
          onClick={tts.resume}
          disabled={!tts.isPaused || tts.isLoading}
          icon={<Play className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="Stoppen"
          ariaLabel="Vorlesen stoppen"
          onClick={tts.stop}
          disabled={!tts.hasSession}
          icon={<Square className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="Von vorne"
          ariaLabel="Vorlesen von vorne starten"
          onClick={tts.restart}
          disabled={!tts.hasSession || tts.isLoading}
          icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="10s zurück"
          ariaLabel="Zehn Sekunden zurückspringen"
          onClick={() => tts.seekBy(-10)}
          disabled={!tts.hasSession || tts.isLoading}
          icon={<SkipBack className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="10s vor"
          ariaLabel="Zehn Sekunden vorspringen"
          onClick={() => tts.seekBy(10)}
          disabled={!tts.hasSession || tts.isLoading}
          icon={<SkipForward className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-200">
          <span>{mmss(tts.currentTime)}</span>
          <span>{mmss(tts.totalDuration)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(tts.progress * 1000)}
          onChange={(event) => tts.seekToProgress(Number(event.target.value) / 1000)}
          aria-label="Wiedergabeposition"
          className="h-2 w-full cursor-pointer accent-slate-100"
        />
      </div>

      {tts.status === "error" && tts.errorMessage ? (
        <div className="mt-3 rounded-xl border border-red-200/40 bg-red-500/10 px-3 py-2 text-xs text-red-100">
          <p className="inline-flex items-center gap-1.5 font-medium">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {tts.errorMessage}
          </p>
          {tts.allowBrowserFallback && (
            <button
              type="button"
              onClick={tts.startBrowserFallback}
              className="mt-2 inline-flex rounded-lg border border-slate-300/40 bg-slate-800 px-2 py-1 font-medium text-slate-100 hover:bg-slate-700"
            >
              Standardstimme verwenden
            </button>
          )}
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          Geschwindigkeit
          <select
            value={String(tts.rate)}
            onChange={(event) => tts.setRate(Number(event.target.value))}
            aria-label="Geschwindigkeit auswaehlen"
            className="min-h-11 rounded-xl border border-slate-300/30 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            {tts.rateOptions.map((option) => (
              <option key={option} value={option}>
                {option.toFixed(2).replace(".", ",")}
                x
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          KI-Stimme
          <select
            value={tts.voiceProfileId}
            onChange={(event) => tts.setVoiceProfileId(event.target.value)}
            aria-label="Stimme auswaehlen"
            className="min-h-11 rounded-xl border border-slate-300/30 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            {tts.voiceProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function ControlButton({
  label,
  ariaLabel,
  onClick,
  disabled,
  icon,
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300/30 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-45"
    >
      {icon}
      {label}
    </button>
  );
}
