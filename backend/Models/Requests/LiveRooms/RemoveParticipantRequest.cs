namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class RemoveParticipantRequest
    {
        public int LiveRoomId { get; set; }
        public int ParticipantId { get; set; }
    }
}
