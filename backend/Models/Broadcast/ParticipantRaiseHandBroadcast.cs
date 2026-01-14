using Newtonsoft.Json;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class ParticipantRaiseHandBroadcast
    {
        [JsonProperty("participantId")]
        public int ParticipantId { get; set; }

        [JsonProperty("participantIdentity")]
        public string ParticipantIdentity { get; set; }

        [JsonProperty("isRaisingHand")]
        public bool IsRaisingHand { get; set; }
    }
}
