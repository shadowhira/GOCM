namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class StudentGradeResponse
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int? SubmissionId { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public decimal? Score { get; set; }
        public decimal? NormalizedScore { get; set; }
        public decimal? Percentage { get; set; }
        public string Status { get; set; } = "not_submitted";
        public string? Feedback { get; set; }
    }
}