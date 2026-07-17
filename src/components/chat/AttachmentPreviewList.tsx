import type { ChatAttachment } from "@/lib/attachment-types";
import { AttachmentPreviewCard } from "@/components/chat/AttachmentPreviewCard";

export function AttachmentPreviewList({
  attachments,
  onRemove,
  onRetry,
  onClear,
}: {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="mb-3 rounded-3xl border border-border bg-card/95 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Anhänge
          </p>
          <p className="text-[11px] text-muted-foreground">
            Nicht gesendete Anhänge werden beim Neuladen entfernt.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Alle entfernen
        </button>
      </div>
      <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
        {attachments.map((attachment) => (
          <AttachmentPreviewCard
            key={attachment.id}
            attachment={attachment}
            onRemove={() => onRemove(attachment.id)}
            onRetry={() => onRetry(attachment.id)}
          />
        ))}
      </div>
    </div>
  );
}
