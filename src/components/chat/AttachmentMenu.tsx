import { Camera, ImageIcon, Paperclip } from "lucide-react";
import type { AttachmentPickerAction } from "@/lib/attachment-types";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  action: AttachmentPickerAction;
  label: string;
  description: string;
  icon: typeof Camera;
}> = [
  {
    action: "camera",
    label: "Foto aufnehmen",
    description: "Kamera öffnen",
    icon: Camera,
  },
  {
    action: "image",
    label: "Foto auswählen",
    description: "Mediathek oder Screenshot",
    icon: ImageIcon,
  },
  {
    action: "file",
    label: "Datei auswählen",
    description: "PDF, Tabellen oder Dokumente",
    icon: Paperclip,
  },
];

export function AttachmentMenu({
  onSelect,
  className,
}: {
  onSelect: (action: AttachmentPickerAction) => void;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.action}
            type="button"
            onClick={() => onSelect(option.action)}
            className="flex min-h-11 w-full items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 text-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">{option.label}</span>
              <span className="block text-xs text-muted-foreground">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
