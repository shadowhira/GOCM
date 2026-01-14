using OnlineClassroomManagement.Helper.BaseModel;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Notifications
{
    public class GetListNotificationRequest : BasePaginatedRequest
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public NotificationStatus? Status { get; set; }
    }
}
