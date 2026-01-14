namespace OnlineClassroomManagement.Models.Requests.Calendar
{
    public class GetCalendarEventsRequest
    {
        /// <summary>
        /// Filter by start date (inclusive). If not provided, defaults to start of current month.
        /// </summary>
        public DateTime? StartDate { get; set; }

        /// <summary>
        /// Filter by end date (inclusive). If not provided, defaults to end of current month.
        /// </summary>
        public DateTime? EndDate { get; set; }

        /// <summary>
        /// Filter by specific class ID. If not provided, returns events from all user's classes.
        /// </summary>
        public int? ClassId { get; set; }

        /// <summary>
        /// Filter by event types: "assignment", "liveroom", "all". Defaults to "all".
        /// </summary>
        public string EventType { get; set; } = "all";
    }
}
