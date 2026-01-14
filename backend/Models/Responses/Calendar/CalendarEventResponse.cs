namespace OnlineClassroomManagement.Models.Responses.Calendar
{
    public class CalendarEventResponse
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string EventType { get; set; } // "assignment" | "liveroom"
        public string? AssignmentType { get; set; } // For assignments only (e.g. "Group", "Individual", ...)
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int ClassId { get; set; }
        public required string ClassName { get; set; }
        public string? Status { get; set; }
        public string? Description { get; set; }
        public bool? IsSubmitted { get; set; } // For assignments only
    }

    public class CalendarEventsResponse
    {
        public List<CalendarEventResponse> Events { get; set; } = new();
        public int TotalCount { get; set; }
    }
}
