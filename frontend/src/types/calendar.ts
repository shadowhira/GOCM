// Calendar Event Types

export type CalendarEventType = "assignment" | "liveroom";

export interface CalendarEvent {
  id: number;
  title: string;
  eventType: CalendarEventType;
  assignmentType?: string | null; // For assignments only (e.g. "Group")
  startDate: string; // ISO date string
  endDate?: string | null; // ISO date string (for liveroom)
  classId: number;
  className: string;
  status?: string;
  description?: string | null;
  isSubmitted?: boolean | null; // For assignments only
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  totalCount: number;
}

export interface GetCalendarEventsRequest {
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  classId?: number;
  eventType?: "all" | "assignment" | "liveroom";
}

// Grouped events by date for display
export interface CalendarEventsByDate {
  [dateKey: string]: CalendarEvent[];
}
