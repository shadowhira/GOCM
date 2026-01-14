using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Models.Responses.Documents
{
    public class DocumentResponse
    {
        public int Id { get; set; }
        public string? PublicUrl { get; set; }
        public string FileName { get; set; } = string.Empty;
        public FileType FileType { get; set; }
        public ParentType ParentType { get; set; }

        // Ai upload tài liệu này
        public ClassMemberResponse UploadedBy { get; set; } = new ClassMemberResponse();

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
