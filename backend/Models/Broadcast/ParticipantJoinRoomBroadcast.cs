using Newtonsoft.Json;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class ParticipantJoinRoomBroadcast
    {
        [JsonProperty("participantId")]
        public int ParticipantId { get; set; }

        [JsonProperty("participantIdentity")]
        public string ParticipantIdentity { get; set; }
    }
}
