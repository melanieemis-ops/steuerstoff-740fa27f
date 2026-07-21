import { Headphones, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReadAloudButtonProps {
  disabled?: boolean;
  onReadFacts: () => void;
  onReadTasks: () => void;
  onReadAll: () => void;
  isSupported: boolean;
}

export function ReadAloudButton({
  disabled = false,
  onReadFacts,
  onReadTasks,
  onReadAll,
  isSupported,
}: ReadAloudButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Vorlesemenue oeffnen"
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Volume2 className="h-4 w-4" aria-hidden="true" />
        Vorlesen
        <Headphones className="h-4 w-4 opacity-70" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Vorleseoptionen"
          className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-lg"
        >
          {!isSupported ? (
            <p className="rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Die Vorlesefunktion wird von diesem Browser leider nicht unterstuetzt.
            </p>
          ) : (
            <div className="space-y-1">
              <MenuButton
                label="Sachverhalt vorlesen"
                onClick={() => {
                  onReadFacts();
                  setIsOpen(false);
                }}
              />
              <MenuButton
                label="Aufgabenstellung vorlesen"
                onClick={() => {
                  onReadTasks();
                  setIsOpen(false);
                }}
              />
              <MenuButton
                label="Alles vorlesen"
                onClick={() => {
                  onReadAll();
                  setIsOpen(false);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="inline-flex min-h-11 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span>{label}</span>
    </button>
  );
}
