using Newtonsoft.Json;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class RoomNotificationBroadcast
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("type")]
        public RoomNotificationType Type { get; set; }
        [JsonProperty("notification")]
        public string Notification { get; set; } = string.Empty;
        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }
    }
}
