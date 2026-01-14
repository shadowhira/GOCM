using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses
{
    public class AttachmentResponse
    {
        public int Id { get; set; }
        public string? PublicUrl { get; set; }
        public string FileName { get; set; }
        public FileType FileType { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ParentType ParentType { get; set; } // document được tạo từ đâu [POST, ASSIGNMENT, COMMENT]
    }
}
