namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class StudentGradesSummaryResponse
    {
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public decimal AverageScore { get; set; }
        public decimal AveragePercentage { get; set; }
        public int TotalAssignments { get; set; }
        public int GradedCount { get; set; }
        public int PendingCount { get; set; }
        public int NotSubmittedCount { get; set; }
        public List<StudentAssignmentGradeResponse> Assignments { get; set; } = new();
    }

}


