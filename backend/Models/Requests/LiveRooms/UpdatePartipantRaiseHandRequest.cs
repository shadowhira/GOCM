namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class UpdatePartipantRaiseHandRequest
    {
        public long LiveRoomId { get; set; }
        public int ParticipantId { get; set; }
        public bool IsRaisingHand { get; set; }
    }
}
