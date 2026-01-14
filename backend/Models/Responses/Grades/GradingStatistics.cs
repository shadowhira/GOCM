namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class GradingStatistics
    {
        public int TotalSubmissions { get; set; }
        public int GradedSubmissions { get; set; }
        public int UngradedSubmissions { get; set; }
        public double AverageScore { get; set; }
        public double HighestScore { get; set; }
        public double LowestScore { get; set; }
        public double GradingProgress => TotalSubmissions == 0 ? 0 : (double)GradedSubmissions / TotalSubmissions * 100;
    }
}