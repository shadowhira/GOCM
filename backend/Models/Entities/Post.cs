using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class Post
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public List<Document> Documents { get; set; } = new();
        public ClassMember CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public PostStatus Status { get; set; }
        public List<Comment> Comments { get; set; } = new();
    }
}
