using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Calendar;
using OnlineClassroomManagement.Models.Responses.Calendar;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface ICalendarService
    {
        Task<CalendarEventsResponse> GetCalendarEvents(GetCalendarEventsRequest request);
    }

    public class CalendarService : ICalendarService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;

        public CalendarService(IRepository repository, ICurrentUserService currentUserService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
        }

        public async Task<CalendarEventsResponse> GetCalendarEvents(GetCalendarEventsRequest request)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                return new CalendarEventsResponse();
            }

            // Default date range: current month
            DateTime startDate = request.StartDate?.ToUniversalTime() ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            DateTime endDate = request.EndDate?.ToUniversalTime() ?? startDate.AddMonths(1).AddDays(-1);

            List<CalendarEventResponse> events = new();

            // Get user's class IDs
            Specification<ClassMember> memberSpec = new();
            memberSpec.Conditions.Add(cm => cm.User.Id == currentUser.Id);
            memberSpec.Includes = q => q.Include(cm => cm.Class);
            List<ClassMember> userMemberships = await _repository.GetListAsync(memberSpec);

            List<int> userClassIds = userMemberships.Select(m => m.Class.Id).ToList();

            // Apply class filter if specified
            if (request.ClassId.HasValue)
            {
                userClassIds = userClassIds.Where(id => id == request.ClassId.Value).ToList();
            }

            if (!userClassIds.Any())
            {
                return new CalendarEventsResponse();
            }

            // Get Assignments if event type includes assignments
            if (request.EventType == "all" || request.EventType == "assignment")
            {
                Specification<AssignmentInClass> assignmentSpec = new();
                assignmentSpec.Conditions.Add(aic => userClassIds.Contains(aic.Class.Id));
                assignmentSpec.Conditions.Add(aic => aic.Assignment.Deadline >= startDate && aic.Assignment.Deadline <= endDate);
                assignmentSpec.Includes = q => q
                    .Include(aic => aic.Assignment)
                    .Include(aic => aic.Class)
                    .Include(aic => aic.Submissions.Where(s => s.SubmitBy.User.Id == currentUser.Id));

                List<AssignmentInClass> assignments = await _repository.GetListAsync(assignmentSpec);

                foreach (var aic in assignments)
                {
                    bool isSubmitted = aic.Submissions?.Any(s => s.SubmitBy?.User?.Id == currentUser.Id) ?? false;

                    events.Add(new CalendarEventResponse
                    {
                        Id = aic.Assignment.Id,
                        Title = aic.Assignment.Title,
                        EventType = "assignment",
                        AssignmentType = aic.Assignment.Type.ToString(),
                        StartDate = aic.Assignment.Deadline,
                        EndDate = null,
                        ClassId = aic.Class.Id,
                        ClassName = aic.Class.Name,
                        Status = aic.Assignment.Status.ToString(),
                        Description = aic.Assignment.Content,
                        IsSubmitted = isSubmitted
                    });
                }
            }

            // Get LiveRooms if event type includes liverooms
            if (request.EventType == "all" || request.EventType == "liveroom")
            {
                Specification<LiveRoom> liveRoomSpec = new();
                liveRoomSpec.Conditions.Add(lr => userClassIds.Contains(lr.Class.Id));
                liveRoomSpec.Conditions.Add(lr => lr.ScheduledStartAt >= startDate && lr.ScheduledStartAt <= endDate);
                liveRoomSpec.Includes = q => q.Include(lr => lr.Class);

                List<LiveRoom> liveRooms = await _repository.GetListAsync(liveRoomSpec);

                foreach (var lr in liveRooms)
                {
                    events.Add(new CalendarEventResponse
                    {
                        Id = lr.Id,
                        Title = lr.Title,
                        EventType = "liveroom",
                        AssignmentType = null,
                        StartDate = lr.ScheduledStartAt,
                        EndDate = lr.ScheduledEndAt,
                        ClassId = lr.Class.Id,
                        ClassName = lr.Class.Name,
                        Status = lr.Status.ToString(),
                        Description = null,
                        IsSubmitted = null
                    });
                }
            }

            // Sort by StartDate
            events = events.OrderBy(e => e.StartDate).ToList();

            return new CalendarEventsResponse
            {
                Events = events,
                TotalCount = events.Count
            };
        }
    }
}
