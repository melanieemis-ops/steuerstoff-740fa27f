/**
 * MessageSpeechControls.tsx
 *
 * Vorlesebutton für eine einzelne Assistentenantwort.
 * Zeigt Play / Pause / Fortsetzen / Stopp abhängig vom Zustand.
 */

import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useSpeechContext } from "@/hooks/useSpeechSynthesis";

interface MessageSpeechControlsProps {
  /** ID der Nachricht */
  messageId: string;
  /** Rohtext der Antwort (Markdown) */
  rawText: string;
  /** Ob die Antwort noch gestreamt wird (deaktiviert Button) */
  isStreaming?: boolean;
}

export function MessageSpeechControls({
  messageId,
  rawText,
  isStreaming = false,
}: MessageSpeechControlsProps) {
  const { isSupported, activeId, state, speak, pause, resume, cancel } = useSpeechContext();

  if (!isSupported) return null;

  const isThisActive = activeId === messageId;
  const isPlaying = isThisActive && state === "playing";
  const isPaused = isThisActive && state === "paused";
  const disabled = isStreaming || !rawText.trim();

  function handleMainButton() {
    if (disabled) return;
    if (!isThisActive || state === "idle") {
      speak(messageId, rawText);
    } else if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    }
  }

  // Stil-Klassen
  const baseBtn =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 touch-manipulation";

  const idleBtn = `${baseBtn} text-muted-foreground hover:bg-accent hover:text-foreground`;
  const activeBtn = `${baseBtn} text-foreground bg-accent/60 ring-1 ring-cyan-400/50 dark:ring-cyan-500/50`;

  const mainClass = isThisActive ? activeBtn : idleBtn;

  // Aria-Labels
  let mainAriaLabel: string;
  let mainLabel: string;
  let MainIcon: typeof Volume2;

  if (isPlaying) {
    mainAriaLabel = "Vorlesen pausieren";
    mainLabel = "Pausieren";
    MainIcon = Pause;
  } else if (isPaused) {
    mainAriaLabel = "Vorlesen fortsetzen";
    mainLabel = "Fortsetzen";
    MainIcon = Play;
  } else {
    mainAriaLabel = "Antwort vorlesen";
    mainLabel = "Vorlesen";
    MainIcon = Volume2;
  }

  return (
    <div className="flex items-center gap-1 mt-1" role="group" aria-label="Vorlese-Steuerung">
      {/* Statuslabel für Screenreader */}
      <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isPlaying ? "Wird vorgelesen …" : isPaused ? "Vorlesen pausiert" : ""}
      </span>

      {/* Haupt-Button: Play / Pause / Fortsetzen */}
      <button
        type="button"
        onClick={handleMainButton}
        disabled={disabled}
        aria-label={mainAriaLabel}
        aria-pressed={isThisActive}
        className={mainClass}
        style={{ minHeight: 44, minWidth: 44 }}
      >
        <MainIcon className="h-3 w-3" aria-hidden="true" />
        <span>{mainLabel}</span>
      </button>

      {/* Stopp-Button – nur wenn aktiv */}
      {isThisActive && (
        <button
          type="button"
          onClick={cancel}
          aria-label="Vorlesen beenden"
          className={`${idleBtn} ml-0.5`}
          style={{ minHeight: 44, minWidth: 44 }}
        >
          <Square className="h-3 w-3" aria-hidden="true" />
          <span>Beenden</span>
        </button>
      )}

      {/* Optionales Status-Label */}
      {isThisActive && (
        <span aria-hidden="true" className="ml-1 text-[10px] text-muted-foreground select-none">
          {isPlaying ? "Wird vorgelesen …" : "Vorlesen pausiert"}
        </span>
      )}
    </div>
  );
}
