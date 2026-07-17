import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  RefreshCw,
  X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ChatAttachment } from "@/lib/attachment-types";
import { formatFileSize, getAttachmentIconLabel } from "@/lib/attachment-utils";

function AttachmentTypeIcon({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.kind === "image") return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  if (attachment.kind === "spreadsheet")
    return <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

function getStatusLabel(attachment: ChatAttachment) {
  switch (attachment.uploadStatus) {
    case "selected":
      return "Wird vorbereitet …";
    case "preparing":
      return "Wird vorbereitet …";
    case "uploading":
      return "Wird hochgeladen …";
    case "ready":
      return "Bereit";
    default:
      return "Fehlgeschlagen";
  }
}

export function AttachmentPreviewCard({
  attachment,
  onRemove,
  onRetry,
}: {
  attachment: ChatAttachment;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const statusLabel = getStatusLabel(attachment);

  return (
    <div className="rounded-2xl border border-border bg-background/90 p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
          {attachment.kind === "image" && attachment.previewUrl ? (
            <img src={attachment.previewUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <AttachmentTypeIcon attachment={attachment} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground" title={attachment.name}>
            {attachment.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {getAttachmentIconLabel(attachment.kind)} · {formatFileSize(attachment.size)}
          </p>
          <div className="mt-2" aria-live="polite">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {attachment.uploadStatus === "ready" ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
              ) : attachment.uploadStatus === "error" ? (
                <AlertCircle className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
              ) : (
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-foreground"
                  aria-hidden="true"
                />
              )}
              <span>{statusLabel}</span>
              {attachment.uploadStatus === "uploading" &&
                typeof attachment.progress === "number" && <span>{attachment.progress}%</span>}
            </div>
            {(attachment.uploadStatus === "uploading" ||
              attachment.uploadStatus === "preparing") && (
              <Progress value={attachment.progress ?? 10} className="mt-2 h-1.5" />
            )}
            {attachment.uploadStatus === "error" && attachment.error && (
              <p className="mt-1 text-xs text-destructive">{attachment.error}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {attachment.uploadStatus === "error" && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Upload für ${attachment.name} wiederholen`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${attachment.name} entfernen`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
