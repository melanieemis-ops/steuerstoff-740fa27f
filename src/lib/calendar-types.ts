export type CalendarView = "year" | "month" | "week" | "agenda";

export type CalendarCategory =
  | "tax"
  | "exam"
  | "learning"
  | "client"
  | "office"
  | "personal";

export type CalendarAgendaFilter =
  | "all"
  | "tax"
  | "exam"
  | "learning"
  | "client"
  | "office"
  | "personal"
  | "completed"
  | "overdue";

export type CalendarReminderOption =
  | "none"
  | "same-day"
  | "1-day"
  | "3-days"
  | "7-days"
  | "14-days"
  | "custom";

export type CalendarRecurrenceType =
  | "none"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  category: CalendarCategory;
  client?: string;
  note?: string;
  location?: string;
  reminder: CalendarReminderOption;
  reminderDays: number[];
  recurrence?: {
    type: CalendarRecurrenceType;
    interval?: number;
    until?: string;
  };
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarOccurrence extends CalendarEvent {
  occurrenceDate: string;
  occurrenceKey: string;
}

export interface CalendarAlertState {
  hasAlerts: boolean;
  todayCount: number;
  overdueCount: number;
  nextEvent?: CalendarEvent;
}
