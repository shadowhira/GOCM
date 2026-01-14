namespace OnlineClassroomManagement.Models.Responses.Quizs
{
    public class QuizAnswerResponse
    {
        public int Id { get; set; }
        public int QuizQuestionId { get; set; }
        public List<int> SelectedOptionIds { get; set; } = new List<int>();
        public int TimeSpent { get; set; } // in seconds
        public DateTime AnsweredAt { get; set; }
    }
}