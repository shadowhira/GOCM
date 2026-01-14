namespace OnlineClassroomManagement.Models.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public ClassMember CreatedBy { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? ParentCommentId { get; set; }
        public Comment? ParentComment { get; set; }
        public Document? Document { get; set; }
        public List<Comment> Replies { get; set; } = new List<Comment>();
    }
}
