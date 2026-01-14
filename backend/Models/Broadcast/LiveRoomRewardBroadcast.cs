using Newtonsoft.Json;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class LiveRoomRewardBroadcast
    {
        [JsonProperty("participantId")]
        public int ParticipantId { get; set; }

        [JsonProperty("rewardActivityId")]
        public int RewardActivityId { get; set; }

        [JsonProperty("classId")]
        public int ClassId { get; set; }

        [JsonProperty("targetUserId")]
        public int TargetUserId { get; set; }

        [JsonProperty("targetDisplayName")]
        public string TargetDisplayName { get; set; } = string.Empty;

        [JsonProperty("activityType")]
        public ActivityType ActivityType { get; set; }

        [JsonProperty("deltaPoints")]
        public int DeltaPoints { get; set; }

        [JsonProperty("reason")]
        public string? Reason { get; set; }
    }
}
