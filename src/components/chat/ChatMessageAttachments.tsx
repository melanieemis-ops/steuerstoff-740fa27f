import { useState } from "react";
import { ExternalLink, FileSpreadsheet, FileText, ImageIcon } from "lucide-react";
import type { ChatMessageAttachment } from "@/lib/attachment-types";
import { formatFileSize, getAttachmentIconLabel } from "@/lib/attachment-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AttachmentGlyph({ kind }: { kind: ChatMessageAttachment["kind"] }) {
  if (kind === "image") return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  if (kind === "spreadsheet") return <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

export function ChatMessageAttachments({ attachments }: { attachments: ChatMessageAttachment[] }) {
  const [activeImage, setActiveImage] = useState<ChatMessageAttachment | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div className="mb-3 grid gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="max-w-full overflow-hidden rounded-2xl border border-current/10 bg-black/5 px-3 py-2 text-left dark:bg-white/5"
          >
            {attachment.kind === "image" ? (
              <button
                type="button"
                onClick={() => setActiveImage(attachment)}
                className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <img
                  src={attachment.downloadUrl}
                  alt={attachment.name}
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{attachment.name}</span>
                  <span className="block text-xs opacity-80">
                    {formatFileSize(attachment.size)} · Bild öffnen
                  </span>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 dark:bg-white/10">
                  <AttachmentGlyph kind={attachment.kind} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium" title={attachment.name}>
                    {attachment.name}
                  </span>
                  <span className="block text-xs opacity-80">
                    {getAttachmentIconLabel(attachment.kind)} · {formatFileSize(attachment.size)}
                  </span>
                </span>
                <a
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-1 rounded-full border border-current/15 px-3 text-xs font-medium hover:bg-white/10"
                >
                  Öffnen
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
      <Dialog open={Boolean(activeImage)} onOpenChange={(open) => !open && setActiveImage(null)}>
        <DialogContent className="max-w-3xl overflow-hidden rounded-3xl border-border bg-background p-0">
          {activeImage && (
            <>
              <DialogHeader className="border-b border-border px-6 py-4">
                <DialogTitle className="truncate">{activeImage.name}</DialogTitle>
                <DialogDescription>{formatFileSize(activeImage.size)}</DialogDescription>
              </DialogHeader>
              <div className="max-h-[75vh] overflow-auto bg-black/95 p-4">
                <img
                  src={activeImage.downloadUrl}
                  alt={activeImage.name}
                  className="mx-auto max-h-[68vh] w-auto max-w-full rounded-2xl object-contain"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
