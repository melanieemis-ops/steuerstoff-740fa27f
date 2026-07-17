export type CalendarCategory =
  | "tax"
  | "exam"
  | "learning"
  | "client"
  | "office"
  | "personal";

export type RecurrenceType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type Recurrence = {
  type: RecurrenceType;
  interval?: number;
  until?: string; // YYYY-MM-DD
};

export type CalendarEvent = {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:mm
  endTime?: string;
  allDay: boolean;
  category: CalendarCategory;
  client?: string;
  note?: string;
  location?: string;
  reminderDays: number[];
  recurrence?: Recurrence;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CalendarView = "year" | "month" | "week" | "agenda";

export const CATEGORY_META: Record<
  CalendarCategory,
  { label: string; color: string; dot: string }
> = {
  tax: {
    label: "Steuerfrist",
    color: "oklch(0.7 0.09 15)",
    dot: "oklch(0.7 0.09 15)",
  },
  exam: {
    label: "Prüfung",
    color: "oklch(0.7 0.12 80)",
    dot: "oklch(0.7 0.12 80)",
  },
  learning: {
    label: "Lernen",
    color: "oklch(0.65 0.13 250)",
    dot: "oklch(0.65 0.13 250)",
  },
  client: {
    label: "Mandant",
    color: "oklch(0.5 0.09 265)",
    dot: "oklch(0.5 0.09 265)",
  },
  office: {
    label: "Kanzlei",
    color: "oklch(0.55 0.1 200)",
    dot: "oklch(0.55 0.1 200)",
  },
  personal: {
    label: "Persönlich",
    color: "oklch(0.6 0.08 155)",
    dot: "oklch(0.6 0.08 155)",
  },
};

export const OVERDUE_COLOR = "oklch(0.6 0.2 20)";
export const DONE_COLOR = "oklch(0.6 0.14 155)";
