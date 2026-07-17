import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ATTACHMENT_PRIVACY_URL } from "@/lib/attachment-types";

export function UploadSafetyNotice({
  open,
  onAccept,
  onOpenChange,
}: {
  open: boolean;
  onAccept: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dateien sicher verwenden</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Bitte lade derzeit ausschließlich anonymisierte Test- und Beispieldateien hoch. Reale
            Mandantendaten, Steuerbescheide, Kontoauszüge, Gesundheitsdaten, Ausweisdaten oder
            andere vertrauliche Echtdaten sind für diese Testversion noch nicht vorgesehen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <a
            href={ATTACHMENT_PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Datenschutzerklärung lesen
          </a>
          <button
            type="button"
            onClick={onAccept}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-foreground px-4 text-sm font-semibold text-background hover:bg-foreground/90"
          >
            Verstanden
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
