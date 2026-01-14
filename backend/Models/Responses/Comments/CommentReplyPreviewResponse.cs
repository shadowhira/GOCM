using OnlineClassroomManagement.Models.Responses.Classes;
using OnlineClassroomManagement.Models.Responses.Documents;

namespace OnlineClassroomManagement.Models.Responses.Comments
{
    public class CommentReplyPreviewResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ClassMemberResponse CreatedBy { get; set; } = null!;
        public DocumentResponse? Document { get; set; }
    }
}
