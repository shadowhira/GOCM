using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Requests.Calendar;
using OnlineClassroomManagement.Models.Responses.Calendar;
using OnlineClassroomManagement.Services;

namespace OnlineClassroomManagement.Controllers
{
    public class CalendarController : ApiControllerBase
    {
        private readonly ICalendarService _calendarService;

        public CalendarController(ICalendarService calendarService)
        {
            _calendarService = calendarService;
        }

        /// <summary>
        /// Get calendar events (assignments and live rooms) for the current user
        /// </summary>
        /// <param name="request">Filter parameters including date range, class ID, and event type</param>
        /// <returns>List of calendar events</returns>
        [HttpGet("events")]
        public async Task<CalendarEventsResponse> GetCalendarEvents([FromQuery] GetCalendarEventsRequest request)
        {
            return await _calendarService.GetCalendarEvents(request);
        }
    }
}
