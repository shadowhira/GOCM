using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Models.Responses.LiveRooms
{
    public class LiveRoomResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime ScheduledStartAt { get; set; }
        public DateTime ScheduledEndAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public ClassMemberResponse CreatedBy { get; set; }
        public LiveRoomStatus Status { get; set; }
        public int ClassId { get; set; }
    }
}
