namespace OnlineClassroomManagement.Models.Requests.Quiz
{
    public class CreateQuizAnswerRequest
    {
        public int QuizQuestionId { get; set; }
        public List<int> SelectedOptionIds { get; set; } = new List<int>();
        public bool IsCorrect { get; set; }
        public int TimeSpent { get; set; } // in seconds
        public DateTime AnsweredAt { get; set; }
    }
}