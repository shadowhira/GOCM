using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Notifications
{
    public class NotificationResponse
    {
        public long Id { get; set; }
        public NotificationStatus Status { get; set; }
        public bool IsRead { get; set; }
        public string Type { get; set; } = "legacy";
        public Dictionary<string, string> Data { get; set; } = new();
        public string SenderAvatarUrl { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string LinkRedirect { set; get; } = string.Empty; // Nên truyền đường dẫn tương đối
        public bool OpenNewTab { get; set; } = false;
    }
}
