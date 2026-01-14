using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class Assignment
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Content { get; set; }
        public List<Document> Attachments { get; set; } = new();
        public DateTime Deadline { get; set; }
        public double MaxScore { get; set; }
        public ClassMember CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public AssignmentStatus Status { get; set; }
        public AssignmentType Type { get; set; }
        //public int? TotalQuestion { get; set; } Nên truy vấn để chính xác hơn
        public List<QuizQuestion> ListQuestions { get; set; } = new();
        public bool AllowShowResultToStudent { get; set; }
    }
}