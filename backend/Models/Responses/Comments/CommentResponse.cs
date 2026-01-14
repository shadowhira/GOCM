using OnlineClassroomManagement.Models.Responses.Classes;
using OnlineClassroomManagement.Models.Responses.Documents;

namespace OnlineClassroomManagement.Models.Responses.Comments
{
    public class CommentResponse
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ClassMemberResponse CreatedBy { get; set; } = null!;
        public int? ParentCommentId { get; set; }
        public DocumentResponse? Document { get; set; }
        public int ReplyCount { get; set; }
        public List<CommentReplyPreviewResponse> LatestReplies { get; set; } = new();
    }
}
