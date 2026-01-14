using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public NotificationStatus Status { get; set; }
        //public string Title { get; set; }
        public string Type { get; set; } = "legacy";
        // JSON string for flexible data payload (frontend will translate based on Type)
        public string Data { get; set; } = "{}";
        public User Receiver { get; set; }
        public User? Sender { get; set; } // Null = Hệ thống
        public DateTime CreatedAt { get; set; }
        public string LinkRedirect { set; get; } = string.Empty; // Nên truyền đường dẫn tương đối
        public bool OpenNewTab { get; set; } = false;
    }
}
