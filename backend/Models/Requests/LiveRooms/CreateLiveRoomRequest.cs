namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class CreateLiveRoomRequest
    {
        public string Title { get; set; }
        public DateTime ScheduledStartAt { get; set; }
        public DateTime ScheduledEndAt { get; set; }
        public long ClassId { get; set; }
    }
}
