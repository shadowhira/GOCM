namespace OnlineClassroomManagement.Models.Requests
{
    public class CreateNotificationRequest
    {
        // Định danh loại thông báo để FE tự dịch theo i18n key
        public string Type { get; set; } = "legacy";
        // Dữ liệu kèm theo (FE sẽ interpolate vào template theo i18n)
        public Dictionary<string, string> Data { get; set; } = new();
        public int? SenderId { get; set; }
        public List<int> ReceiverIds { get; set; } = new List<int>();
        public string LinkRedirect { set; get; } = string.Empty;
        public bool OpenNewTab { get; set; } = false;

        // Các trường cho gửi email
        public bool NeedSendEmail { get; set; } = false;
        public string? MailTitle { get; set; }
        public string? MailHtmlContent { get; set; } // HTML Format
    }
}
