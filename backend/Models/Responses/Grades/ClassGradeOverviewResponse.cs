namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class ClassGradeOverviewResponse
    {
        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public int TotalStudents { get; set; }
        public int TotalAssignments { get; set; }
        public double AverageClassScore { get; set; }
        public double AverageClassPercentage { get; set; }
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }
        public double GradingProgress { get; set; }
    }
}