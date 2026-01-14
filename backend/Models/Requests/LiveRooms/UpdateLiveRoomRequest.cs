namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class UpdateLiveRoomRequest
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public DateTime ScheduledStartAt { get; set; }
        public DateTime ScheduledEndAt { get; set; }
    }
}
