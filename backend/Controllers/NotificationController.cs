using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Notifications;
using OnlineClassroomManagement.Models.Responses.Notifications;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    public class NotificationController : ApiControllerBase
    {
        private readonly INotificationService _notificationService;
        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [Obsolete("Use this api for testing only! This api will be removed in the future")]
        [HttpPost]
        public async Task CreateNotification(CreateNotificationRequest request)
        {
            await _notificationService.CreateNotification(request);
        }

        [HttpGet("get-top")]
        public async Task<List<NotificationResponse>> GetTopNotifcations([FromQuery] GetTopNotificationsRequest request)
        {
            return await _notificationService.GetTopNotifications(request);
        }
        [HttpPut("{id}/mark-read")]
        public async Task MarkAsReaded(int id)
        {
            await _notificationService.MarkNotificationAsReaded(id);
        }

        [HttpPut("{id}/mark-unread")]
        public async Task MarkAsUnread(int id)
        {
            await _notificationService.MarkNotificationAsUnread(id);
        }

        [HttpDelete("{id}")]
        public async Task HideNotification(int id)
        {
            await _notificationService.HideNotification(id);
        }

        [HttpPut("mark-all-read")]
        public async Task MarkAllAsReaded()
        {
            await _notificationService.MarkAllNotificationsAsReaded();
        }

        [HttpGet("get-list")]
        public async Task<ActionResult<PaginatedList<NotificationResponse>>> GetList([FromQuery] GetListNotificationRequest request)
        {
            return await _notificationService.GetListNotification(request);
        }
    }
}
