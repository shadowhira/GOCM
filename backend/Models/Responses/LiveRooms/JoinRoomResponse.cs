using OnlineClassroomManagement.Models.Responses.Participants;

namespace OnlineClassroomManagement.Models.Responses.LiveRooms
{
    public class JoinRoomResponse
    {
        public ParticipantResponse Participant { get; set; }
        public string AccessToken { get; set; }
        public string RoomName { get; set; }
        public string ParticipantName { get; set; }
        public string LivekitServerUrl { get; set; }
        public string LiveRoomBroadcastChannel { get; set; }
    }
}
