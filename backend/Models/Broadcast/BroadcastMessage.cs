using Newtonsoft.Json;

namespace OnlineClassroomManagement.Models.Broadct
{
    public class BroadcastMessage<T> where T : class
    {
        [JsonProperty("event")]
        public string Event { get; set; } = string.Empty;
        [JsonProperty("payload")]
        public T? Payload { get; set; }
    }
}
