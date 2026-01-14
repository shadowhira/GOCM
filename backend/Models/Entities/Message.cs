namespace OnlineClassroomManagement.Models.Entities
{
    public class Message
    {
        public int Id { get; set; }
        public Participant SentBy { get; set; } // Null = Hệ thống
        public LiveRoom LiveRoom { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        //public MessageType Type { get; set; }
        //public Polling? Polling { get; set; } // TODO: Remove
    }
}
