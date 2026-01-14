using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class Document
    {
        public int Id { get; set; }
        public string PublicUrl { get; set; } // đường dẫn truy cập công khai
        public string FilePath { get; set; } // đường dẫn file trong storage
        public string FileName { get; set; }
        public FileType FileType { get; set; }
        public int? ClassId { get; set; }
        public ClassMember UploadedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ParentType ParentType { get; set; } // document được tạo từ đâu [POST, ASSIGNMENT, COMMENT]
    }
}
