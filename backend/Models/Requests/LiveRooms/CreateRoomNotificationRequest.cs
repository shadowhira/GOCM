using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class CreateRoomNotificationRequest
    {
        public long LiveRoomId { get; set; }
        public long ParticipantId { get; set; }
        public RoomNotificationType Type { get; set; }
    }
}
