import type { CalendarEvent } from "@/lib/calendar-types";
import { TAX_DEADLINE_TEMPLATES } from "@/lib/calendar-utils";

interface TaxDeadlineTemplatesProps {
  onSelect: (template: (typeof TAX_DEADLINE_TEMPLATES)[number]) => void;
}

export function TaxDeadlineTemplates({ onSelect }: TaxDeadlineTemplatesProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Steuertermin übernehmen</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {TAX_DEADLINE_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="rounded-2xl border border-border bg-card/80 p-3 text-left transition hover:bg-accent"
          >
            <div className="text-sm font-medium text-foreground">{template.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">Vorlage für {template.category === "tax" ? "Steuerfrist" : template.category === "exam" ? "Prüfung" : "Lernen"}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
