import { CalendarClock, CheckCircle2, Copy, Download, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { CalendarEvent } from "@/lib/calendar-types";
import { formatDateLabel, formatTimeLabel, getEventCategoryColor, getEventCategoryLabel, getReminderLabel } from "@/lib/calendar-utils";
import { downloadIcsFile } from "@/lib/create-ics";

interface EventDetailsProps {
  open: boolean;
  event?: CalendarEvent;
  onClose: () => void;
  onToggleComplete: (event: CalendarEvent) => void;
  onEdit: (event: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function EventDetails({ open, event, onClose, onToggleComplete, onEdit, onDuplicate, onDelete }: EventDetailsProps) {
  if (!event) return null;

  return (
    <AlertDialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">{event.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              <span>{formatDateLabel(event.startDate)}</span>
              <span>·</span>
              <span>{event.allDay ? "Ganztägig" : formatTimeLabel(event.startTime)}</span>
            </div>
            <div className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs ${getEventCategoryColor(event.category)}`}>
              {getEventCategoryLabel(event.category)}
            </div>
            {event.client ? <p className="mt-3 text-sm text-muted-foreground">Mandant: {event.client}</p> : null}
            {event.note ? <p className="mt-2 text-sm leading-6 text-foreground">{event.note}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              Erinnerung: {getReminderLabel(event.reminder)}
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
              Ort: {event.location || "—"}
            </div>
          </div>
        </div>
        <AlertDialogFooter className="flex-wrap">
          <Button variant="outline" onClick={() => onToggleComplete(event)}>
            <CheckCircle2 className="mr-2 h-4 w-4" /> {event.completed ? "Wieder öffnen" : "Erledigt"}
          </Button>
          <Button variant="outline" onClick={() => onEdit(event)}>
            <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
          </Button>
          <Button variant="outline" onClick={() => onDuplicate(event)}>
            <Copy className="mr-2 h-4 w-4" /> Duplizieren
          </Button>
          <Button variant="outline" onClick={() => downloadIcsFile(event)}>
            <Download className="mr-2 h-4 w-4" /> In Gerätekalender speichern
          </Button>
          <Button variant="destructive" onClick={() => { onDelete(event.id); onClose(); }}>
            <Trash2 className="mr-2 h-4 w-4" /> Löschen
          </Button>
          <AlertDialogCancel onClick={onClose}>Schließen</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
