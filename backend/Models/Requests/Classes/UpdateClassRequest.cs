namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class UpdateClassRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? CoverImageUrl { get; set; }  // URL ảnh bìa
        public string? CoverColor { get; set; }     // Mã màu nền thay thế
    }
}