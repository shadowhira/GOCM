using OnlineClassroomManagement.Models.Responses.Classes;
using OnlineClassroomManagement.Models.Responses.Comments;
using OnlineClassroomManagement.Models.Responses.Documents;

namespace OnlineClassroomManagement.Models.Responses.Posts
{
    public class PostResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ClassMemberResponse CreatedBy { get; set; } = null!;
        public List<DocumentResponse> Documents { get; set; } = new();
        public List<CommentResponse> Comments { get; set; } = new();
        public List<ClassResponse> Classes { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public int CommentCount => Comments?.Count ?? 0;
    }
}
