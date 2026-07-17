/**
 * SpeechMiniPlayer.tsx
 *
 * Kompakter schwebender Miniplayer für mobile Geräte.
 * Erscheint während Vorlesen oberhalb der unteren Navigation.
 * Wird vollständig aus dem DOM entfernt, wenn Vorlesen beendet ist.
 */

import { createPortal } from "react-dom";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useSpeechContext } from "@/hooks/useSpeechSynthesis";
import { useEffect, useState } from "react";

export function SpeechMiniPlayer() {
  const { isSupported, activeId, state, pause, resume, cancel } = useSpeechContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = isSupported && activeId !== null;
  const isPlaying = state === "playing";

  if (!mounted || !isActive) return null;

  const player = (
    <div
      role="region"
      aria-label="steuerstoff liest vor"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] left-1/2 z-40 -translate-x-1/2 md:hidden"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/95 px-3 py-2 shadow-lg backdrop-blur"
        style={{ pointerEvents: "auto" }}
      >
        {/* Animiertes Icon */}
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--gradient-accent)" }}
        >
          <Volume2 className="h-3 w-3 text-background" />
        </span>

        <span className="text-[11px] font-medium text-foreground select-none whitespace-nowrap">
          steuerstoff liest vor
        </span>

        {/* Pause / Fortsetzen */}
        <button
          type="button"
          onClick={isPlaying ? pause : resume}
          aria-label={isPlaying ? "Vorlesen pausieren" : "Vorlesen fortsetzen"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>

        {/* Stopp */}
        <button
          type="button"
          onClick={cancel}
          aria-label="Vorlesen beenden"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return createPortal(player, document.body);
}
