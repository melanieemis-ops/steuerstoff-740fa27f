import { useEffect, useMemo, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CalendarEvent, CalendarRecurrenceType, CalendarReminderOption, CalendarCategory } from "@/lib/calendar-types";
import { createEmptyEventDate, formatDateKey, TAX_DEADLINE_TEMPLATES } from "@/lib/calendar-utils";
import { TaxDeadlineTemplates } from "./TaxDeadlineTemplates";

interface EventDialogProps {
  open: boolean;
  event?: CalendarEvent;
  selectedDate: string;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
}

export function EventDialog({ open, event, selectedDate, onClose, onSave, onDelete }: EventDialogProps) {
  const [draft, setDraft] = useState<CalendarEvent>(createEmptyEventDate(selectedDate));

  useEffect(() => {
    if (event) {
      setDraft(event);
    } else {
      setDraft(createEmptyEventDate(selectedDate));
    }
  }, [event, selectedDate, open]);

  const isEditing = Boolean(event);

  const handleSubmit = () => {
    if (!draft.title.trim()) return;
    const nextEvent: CalendarEvent = {
      ...draft,
      title: draft.title.trim(),
      id: event?.id ?? `event-${Date.now()}`,
      startDate: draft.startDate || selectedDate,
      endDate: draft.endDate || draft.startDate || selectedDate,
      allDay: draft.allDay,
      reminderDays: draft.reminder === "none" ? [] : [7],
      updatedAt: new Date().toISOString(),
      createdAt: event?.createdAt ?? new Date().toISOString(),
    };
    onSave(nextEvent);
    onClose();
  };

  const applyTemplate = (template: (typeof TAX_DEADLINE_TEMPLATES)[number]) => {
    setDraft((current) => ({
      ...current,
      title: template.title,
      category: template.category,
      reminder: template.reminder,
      reminderDays: [7],
      recurrence: template.recurrence,
    }));
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => { if (!value) onClose(); }}>
      <AlertDialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{isEditing ? "Termin bearbeiten" : "Termin hinzufügen"}</AlertDialogTitle>
          <AlertDialogDescription>
            {isEditing ? "Passe den Termin an oder markiere ihn als erledigt." : "Erstelle einen steuerlichen oder organisatorischen Termin direkt im Kalender."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Titel</Label>
            <Input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="z. B. Umsatzsteuer-Voranmeldung" />
          </div>
          <div>
            <Label>Datum</Label>
            <Input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} />
          </div>
          <div>
            <Label>Enddatum</Label>
            <Input type="date" value={draft.endDate ?? draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
          </div>
          <div>
            <Label>Uhrzeit</Label>
            <Input type="time" value={draft.startTime ?? "09:00"} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} />
          </div>
          <div>
            <Label>Endzeit</Label>
            <Input type="time" value={draft.endTime ?? draft.startTime ?? "10:00"} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-border p-3">
            <Label>Ganztägig</Label>
            <Switch checked={draft.allDay} onCheckedChange={(checked) => setDraft((current) => ({ ...current, allDay: checked }))} />
          </div>
          <div>
            <Label>Kategorie</Label>
            <Select value={draft.category} onValueChange={(value) => setDraft((current) => ({ ...current, category: value as CalendarCategory }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tax">Steuerfrist</SelectItem>
                <SelectItem value="exam">Prüfung</SelectItem>
                <SelectItem value="learning">Lernen</SelectItem>
                <SelectItem value="client">Mandant</SelectItem>
                <SelectItem value="office">Kanzlei</SelectItem>
                <SelectItem value="personal">Persönlich</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Mandant / Bezug</Label>
            <Input value={draft.client ?? ""} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <Label>Notiz</Label>
            <Textarea value={draft.note ?? ""} onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} />
          </div>
          <div>
            <Label>Erinnerung</Label>
            <Select value={draft.reminder} onValueChange={(value) => setDraft((current) => ({ ...current, reminder: value as CalendarReminderOption }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">keine Erinnerung</SelectItem>
                <SelectItem value="same-day">am selben Tag</SelectItem>
                <SelectItem value="1-day">1 Tag vorher</SelectItem>
                <SelectItem value="3-days">3 Tage vorher</SelectItem>
                <SelectItem value="7-days">7 Tage vorher</SelectItem>
                <SelectItem value="14-days">14 Tage vorher</SelectItem>
                <SelectItem value="custom">benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Wiederholung</Label>
            <Select value={draft.recurrence?.type ?? "none"} onValueChange={(value) => setDraft((current) => ({ ...current, recurrence: { type: value as CalendarRecurrenceType, interval: 1 } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">keine</SelectItem>
                <SelectItem value="daily">täglich</SelectItem>
                <SelectItem value="weekly">wöchentlich</SelectItem>
                <SelectItem value="monthly">monatlich</SelectItem>
                <SelectItem value="yearly">jährlich</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Ort</Label>
            <Input value={draft.location ?? ""} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={draft.completed ? "completed" : "open"} onValueChange={(value) => setDraft((current) => ({ ...current, completed: value === "completed" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="completed">Erledigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <TaxDeadlineTemplates onSelect={applyTemplate} />
          </div>
        </div>

        <AlertDialogFooter className="mt-4 flex-wrap gap-2">
          {isEditing && onDelete ? (
            <Button variant="destructive" onClick={() => { onDelete(event!.id); onClose(); }}>
              Löschen
            </Button>
          ) : null}
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Speichern</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
