import httpClient from "@/lib/axios";
import type {
  CalendarEventsResponse,
  GetCalendarEventsRequest,
} from "@/types/calendar";

export const calendarApi = {
  /**
   * GET /api/Calendar/events
   * Get calendar events (assignments and live rooms) for the current user
   */
  getEvents: (params?: GetCalendarEventsRequest): Promise<CalendarEventsResponse> =>
    httpClient.get("/Calendar/events", { params }),
};
