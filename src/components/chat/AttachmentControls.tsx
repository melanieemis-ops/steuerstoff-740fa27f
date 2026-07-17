import { useEffect, useRef, useState, type ChangeEvent } from "react";
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

export function AttachmentPlusButton({
  attachments,
  disabled,
  onFilesPicked,
}: Pick<Props, "attachments" | "disabled" | "onFilesPicked">) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLInputElement | null>(null);
  const photoRef = useRef<HTMLInputElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const reachedLimit = attachments.length >= MAX_ATTACHMENTS;

  function pick(ref: React.RefObject<HTMLInputElement | null>) {
    setOpen(false);
    ref.current?.click();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length) onFilesPicked(files);
    // Reset, damit dieselbe Datei erneut ausgewählt werden kann.
    e.target.value = "";
  }

  return (
    <div ref={rootRef} className="relative">
      <button
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

      {open && (
        <div
          role="menu"
          aria-label="Anhang-Optionen"
          className="absolute bottom-14 left-0 z-50 w-56 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-lg"
        >
          <MenuItem
            icon={<Camera className="h-4 w-4" />}
            label="Foto aufnehmen"
            onClick={() => pick(cameraRef)}
          />
          <MenuItem
            icon={<ImageIcon className="h-4 w-4" />}
            label="Foto auswählen"
            onClick={() => pick(photoRef)}
          />
          <MenuItem
            icon={<FileUp className="h-4 w-4" />}
            label="Datei auswählen"
            onClick={() => pick(fileRef)}
          />
        </div>
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
