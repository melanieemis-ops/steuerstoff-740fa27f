import { useEffect, useState, type RefObject } from "react";
import { Plus } from "lucide-react";
import { AttachmentMenu } from "@/components/chat/AttachmentMenu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AttachmentPickerAction } from "@/lib/attachment-types";
import { isDesktopLike } from "@/lib/attachment-utils";

export function ChatAttachmentButton({
  buttonRef,
  disabled,
  onAction,
}: {
  buttonRef: RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  onAction: (action: AttachmentPickerAction) => void;
}) {
  const [open, setOpen] = useState(false);
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    const update = () => setDesktop(isDesktopLike());
    update();
    if (typeof window === "undefined") return;
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function closeAndFocus() {
    setOpen(false);
    setTimeout(() => buttonRef.current?.focus(), 0);
  }

  function handleAction(action: AttachmentPickerAction) {
    closeAndFocus();
    onAction(action);
  }

  const trigger = (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-label="Dateien oder Fotos hinzufügen"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      style={{ minHeight: 44, minWidth: 44 }}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
    </button>
  );

  if (desktop) {
    return (
      <DropdownMenu
        modal={false}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setTimeout(() => buttonRef.current?.focus(), 0);
        }}
      >
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-[280px] rounded-2xl p-2">
          <AttachmentMenu onSelect={handleAction} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setTimeout(() => buttonRef.current?.focus(), 0);
        }}
      >
        <DrawerContent className="rounded-t-3xl border-border bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerHeader className="px-0 pb-2 pt-5 text-left">
            <DrawerTitle>Dateien hinzufügen</DrawerTitle>
            <DrawerDescription>
              Foto aufnehmen, Bilder auswählen oder Dokumente anhängen.
            </DrawerDescription>
          </DrawerHeader>
          <AttachmentMenu onSelect={handleAction} className="pb-2" />
        </DrawerContent>
      </Drawer>
    </>
  );
}
