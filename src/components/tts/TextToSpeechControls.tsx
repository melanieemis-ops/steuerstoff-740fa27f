import { Pause, Play, RotateCcw, Square, Volume2 } from "lucide-react";
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

  const statusLabel = tts.isSpeaking
    ? "Wird vorgelesen"
    : tts.isPaused
      ? "Pausiert"
      : tts.status === "ended"
        ? "Vorlesen beendet"
        : "Bereit";

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
          disabled={!tts.isSpeaking}
          icon={<Pause className="h-4 w-4" aria-hidden="true" />}
        />
        <ControlButton
          label="Fortsetzen"
          ariaLabel="Vorlesen fortsetzen"
          onClick={tts.resume}
          disabled={!tts.isPaused}
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
          disabled={!tts.hasSession}
          icon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

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
                {option
                  .toFixed(2)
                  .replace(".00", ",0")
                  .replace(".50", ",5")
                  .replace(".75", ",75")
                  .replace(".25", ",25")}
                x
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs">
          Stimme
          <select
            value={tts.voiceURI ?? ""}
            onChange={(event) => tts.setVoice(event.target.value || undefined)}
            aria-label="Stimme auswaehlen"
            className="min-h-11 rounded-xl border border-slate-300/30 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
          >
            <option value="">Automatisch</option>
            {tts.availableVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
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
