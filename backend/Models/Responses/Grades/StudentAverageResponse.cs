namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class StudentAverageResponse
    {
        public int StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentAvatarUrl { get; set; }
        public double AverageScore { get; set; }
        public int TotalAssignments { get; set; }
        public int SubmittedCount { get; set; }
        public int GradedCount { get; set; }
    }
}