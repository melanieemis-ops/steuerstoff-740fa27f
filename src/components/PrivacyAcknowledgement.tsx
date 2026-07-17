import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText } from "lucide-react";

const STORAGE_KEY = "steuerstoff-privacy-acknowledgement-v1";
export const CURRENT_PRIVACY_VERSION = "2026-07-17-upload-v1";
const PDF_URL = "/steuerstoff-datenschutzerklaerung.pdf";

type PrivacyAcknowledgement = {
  version: string;
  acceptedAt: string;
};

function readAcknowledgement(): PrivacyAcknowledgement | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PrivacyAcknowledgement;
    if (parsed && typeof parsed.version === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function hasCurrentPrivacyAcknowledgement(): boolean {
  const a = readAcknowledgement();
  return !!a && a.version === CURRENT_PRIVACY_VERSION;
}

export function PrivacyAcknowledgementGate({ onAccepted }: { onAccepted: () => void }) {
  const [mounted, setMounted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    headingRef.current?.focus();
    return () => {
      body.style.overflow = prev;
    };
  }, [mounted]);

  function confirm() {
    try {
      const payload: PrivacyAcknowledgement = {
        version: CURRENT_PRIVACY_VERSION,
        acceptedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage failures; still proceed
    }
    onAccepted();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="steuerstoff-privacy-title"
      style={{ zIndex: 2147483000 }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md"
    >
      <div
        className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col gap-6 overflow-y-auto rounded-3xl border border-border/60 bg-[#faf7f2] p-6 text-foreground shadow-2xl dark:bg-[#0b1120] sm:p-8"
        style={{
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
          paddingTop: "calc(1.5rem + env(safe-area-inset-top))",
        }}
      >
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-magenta,theme(colors.pink.500))]" />
            steuerstoff
          </span>
          <h1
            ref={headingRef}
            tabIndex={-1}
            id="steuerstoff-privacy-title"
            className="text-2xl font-semibold tracking-tight text-foreground outline-none sm:text-3xl"
          >
            Datenschutz bei steuerstoff
          </h1>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
          <p>
            Bevor du steuerstoff nutzt, erhältst du unsere Informationen zum Umgang mit
            personenbezogenen Daten. Bitte lies die Datenschutzerklärung sorgfältig durch.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Mit deiner Bestätigung erklärst du nicht deine Zustimmung zu optionalen Analyse- oder
            Marketingdiensten. Du bestätigst lediglich, dass dir die Datenschutzhinweise zugänglich
            gemacht wurden.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Für die Vorlesefunktion nutzt steuerstoff die vom Browser und Betriebssystem
            bereitgestellte Sprachausgabe. Die verfügbaren Stimmen und die technische Verarbeitung
            können vom verwendeten Gerät, Betriebssystem und Browser abhängen. steuerstoff bindet
            für diese Funktion derzeit keinen eigenen externen Sprachsyntheseanbieter ein.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Die Datenschutzerklärung enthält außerdem einen neuen Abschnitt zum Datei- und
            Foto-Upload im Chat. Dieser beschreibt die Test-only-Nutzung anonymisierter
            Beispieldateien, die temporäre Zwischenspeicherung sowie die Weitergabe von Anhängen an
            den eingesetzten KI-Anbieter beim Absenden einer Nachricht.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Datenschutzerklärung als PDF in neuem Tab öffnen"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-foreground/80 bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Datenschutzerklärung lesen
          </a>
          <button
            type="button"
            onClick={confirm}
            aria-label="Datenschutzhinweise zur Kenntnis nehmen und steuerstoff starten"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-md transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-base"
          >
            Datenschutzhinweise bestätigen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
