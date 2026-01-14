using Newtonsoft.Json;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class SystemNotificationBroadcast
    {
        [JsonProperty("receiverIds")]
        public List<int> ReceiverIds { get; set; } = new();

        [JsonProperty("type")]
        public string Type { get; set; } = "legacy";

        [JsonProperty("data")]
        public Dictionary<string, string> Data { get; set; } = new();
    }
}
