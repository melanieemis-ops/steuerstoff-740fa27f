import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { Plus, Camera, ImageIcon, FileUp, X, FileText } from "lucide-react";
import {
  IMAGE_ACCEPT,
  DOC_ACCEPT,
  MAX_ATTACHMENTS,
  formatBytes,
  type ChatAttachment,
} from "@/lib/chatAttachments";

type Props = {
  attachments: ChatAttachment[];
  disabled?: boolean;
  onFilesPicked: (files: File[]) => void;
  onRemove: (id: string) => void;
};

function useIsMobileSheet() {
  // Synchronous init to avoid a desktop-popover flash on mobile that would
  // render inside the narrow composer parent and cause vertical letter-wrap.
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isMobile;
}

export function AttachmentPlusButton({
  attachments,
  disabled,
  onFilesPicked,
}: Pick<Props, "attachments" | "disabled" | "onFilesPicked">) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobileSheet();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Desktop: outside-click for popover
  useEffect(() => {
    if (!open || isMobile) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, isMobile]);

  // Mobile: close on outside pointer / Escape (no body scroll lock, no backdrop)
  useEffect(() => {
    if (!open || !isMobile) return;
    function onDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node | null;
      const menuEl = document.getElementById("attachment-floating-menu");
      if (menuEl && target && menuEl.contains(target)) return;
      if (buttonRef.current && target && buttonRef.current.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, isMobile]);

  // Return focus on close
  const prevOpen = useRef(false);
  useEffect(() => {
    if (prevOpen.current && !open) {
      buttonRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const reachedLimit = attachments.length >= MAX_ATTACHMENTS;

  function pick(ref: React.RefObject<HTMLInputElement | null>) {
    setOpen(false);
    // Delay slightly so sheet unmounts before system picker
    setTimeout(() => ref.current?.click(), 0);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFilesPicked(files);
    e.target.value = "";
  }

  const items = [
    { icon: <ImageIcon className="h-5 w-5" />, label: "Fotomediathek", ref: photoRef },
    { icon: <Camera className="h-5 w-5" />, label: "Foto aufnehmen", ref: cameraRef },
    { icon: <FileUp className="h-5 w-5" />, label: "Dateien auswählen", ref: fileRef },
  ] as const;

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || reachedLimit}
        aria-label={
          reachedLimit ? `Maximal ${MAX_ATTACHMENTS} Anhänge erreicht` : "Anhang hinzufügen"
        }
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
          disabled || reachedLimit
            ? "bg-muted text-muted-foreground"
            : "bg-muted text-foreground hover:bg-muted/70"
        }`}
      >
        <Plus className="h-5 w-5" />
      </button>

      {open && !isMobile && (
        <div
          role="menu"
          aria-label="Anhang-Optionen"
          className="absolute bottom-14 left-0 z-50 w-64 min-w-[240px] overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-lg"
        >
          {items.map((it) => (
            <MenuItem
              key={it.label}
              icon={it.icon}
              label={it.label}
              onClick={() => pick(it.ref)}
            />
          ))}
        </div>
      )}

      {open && isMobile && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex flex-col justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Anhang hinzufügen"
          >
            <button
              type="button"
              aria-label="Schließen"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <div
              className="relative mx-3 mb-3 rounded-3xl border border-border bg-card shadow-2xl"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <div className="flex justify-center pt-2">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between px-5 pt-3 pb-2">
                <h2 className="text-base font-semibold text-foreground">Anhang hinzufügen</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Schließen"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-1 px-3 pb-2">
                {items.map((it) => (
                  <button
                    key={it.label}
                    type="button"
                    role="menuitem"
                    onClick={() => pick(it.ref)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-medium text-foreground transition-colors hover:bg-accent min-h-[52px]"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                      {it.icon}
                    </span>
                    <span
                      className="flex-1 whitespace-nowrap break-normal"
                      style={{ overflowWrap: "normal", writingMode: "horizontal-tb" }}
                    >
                      {it.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}

      <input
        ref={cameraRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        ref={photoRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <input
        ref={fileRef}
        type="file"
        accept={DOC_ACCEPT}
        multiple
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-foreground transition-colors hover:bg-accent min-h-[44px]"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

export function AttachmentChips({
  attachments,
  onRemove,
  compact,
}: {
  attachments: ChatAttachment[];
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  if (attachments.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "px-2 pb-2"}`}>
      {attachments.map((a) => (
        <div
          key={a.id}
          className="group relative flex max-w-[220px] items-center gap-2 rounded-xl border border-border bg-background/60 py-1 pl-1 pr-2"
        >
          {a.kind === "image" && a.previewUrl ? (
            <img
              src={a.previewUrl}
              alt={a.name}
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <FileText className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate text-[12px] font-medium text-foreground" title={a.name}>
              {a.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{formatBytes(a.size)}</p>
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              aria-label={`Anhang "${a.name}" entfernen`}
              className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
