using Newtonsoft.Json;

namespace OnlineClassroomManagement.Models.Broadcast
{
    public class MessageBroadcast
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("displayName")]
        public string DisplayName { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }

        [JsonProperty("createdAt")]
        public DateTime CreatedAt { get; set; }

        //[JsonProperty("type")]
        //public MessageType Type { get; set; }
    }
}
