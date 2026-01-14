namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class StudentAssignmentGradeResponse
    {
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = string.Empty;
        public string AssignmentType { get; set; } = string.Empty;
        public decimal MaxScore { get; set; }
        public DateTime? DueDate { get; set; }
        public int? SubmissionId { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public decimal? Score { get; set; }
        public decimal? NormalizedScore { get; set; }
        public decimal? Percentage { get; set; }
        public string Status { get; set; } = string.Empty; // "graded", "pending", "not_submitted"
        public string? Feedback { get; set; }
    }
}
