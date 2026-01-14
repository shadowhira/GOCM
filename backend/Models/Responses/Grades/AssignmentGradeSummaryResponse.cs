namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class AssignmentGradeSummaryResponse
    {
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = string.Empty;
        public string AssignmentType { get; set; } = string.Empty;
        public decimal MaxScore { get; set; }
        public DateTime? DueDate { get; set; }
        public int TotalSubmissions { get; set; }
        public int GradedSubmissions { get; set; }
        public int PendingSubmissions { get; set; }
        public decimal AverageScore { get; set; }
        public decimal AveragePercentage { get; set; }
        public decimal HighestScore { get; set; }
        public decimal LowestScore { get; set; }
        public decimal GradingProgress { get; set; }
    }
}

