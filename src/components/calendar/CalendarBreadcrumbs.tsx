interface CalendarBreadcrumbsProps {
  items: string[];
  onSelect: (index: number) => void;
}

export function CalendarBreadcrumbs({ items, onSelect }: CalendarBreadcrumbsProps) {
  if (!items.length) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {items.map((item, index) => (
        <div key={`${item}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <span>›</span> : null}
          <button type="button" onClick={() => onSelect(index)} className="rounded-full border border-border px-2 py-1 transition hover:bg-accent">
            {item}
          </button>
        </div>
      ))}
    </div>
  );
}
