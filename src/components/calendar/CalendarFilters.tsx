import type { CalendarAgendaFilter } from "@/lib/calendar-types";

interface CalendarFiltersProps {
  filter: CalendarAgendaFilter;
  onChange: (filter: CalendarAgendaFilter) => void;
}

const filters: Array<{ id: CalendarAgendaFilter; label: string }> = [
  { id: "all", label: "Alle" },
  { id: "tax", label: "Steuerfristen" },
  { id: "exam", label: "Prüfung" },
  { id: "learning", label: "Lernen" },
  { id: "client", label: "Mandant" },
  { id: "office", label: "Kanzlei" },
  { id: "personal", label: "Persönlich" },
  { id: "completed", label: "Erledigt" },
  { id: "overdue", label: "Überfällig" },
];

export function CalendarFilters({ filter, onChange }: CalendarFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`rounded-full border px-2.5 py-1.5 text-xs transition ${filter === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
