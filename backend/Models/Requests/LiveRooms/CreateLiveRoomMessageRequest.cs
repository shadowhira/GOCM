namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class CreateLiveRoomMessageRequest
    {
        public int LiveRoomId { get; set; }
        public int ParticipantId { get; set; }
        public string Content { get; set; } = string.Empty;
    }

}
