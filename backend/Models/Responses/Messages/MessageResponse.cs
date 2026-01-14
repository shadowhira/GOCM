using OnlineClassroomManagement.Models.Responses.Participants;

namespace OnlineClassroomManagement.Models.Responses.Messages
{
    public class MessageResponse
    {
        public int Id { get; set; }
        public ParticipantResponse? SentBy { get; set; } // Null = Hệ thống
        public string DisplayName { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } // SendedAt
    }
}
