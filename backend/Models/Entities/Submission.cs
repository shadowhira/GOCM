using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class Submission
    {
        public int Id { get; set; }
        public ClassMember SubmitBy { get; set; }
        public DateTime? SubmittedTime { get; set; }
        public string? Content { get; set; }
        public List<Document> SubmittedFiles { get; set; } = new();
        public SubmissionStatus Status { get; set; }
        public Grade? Grade { get; set; }
        public List<QuizAnswer> Answers { get; set; } = new();
        public AssignmentGroup? AssignmentGroup { get; set; }
    }
}
