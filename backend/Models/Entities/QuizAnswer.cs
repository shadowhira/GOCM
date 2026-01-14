namespace OnlineClassroomManagement.Models.Entities
{
    public class QuizAnswer
    {
        public int Id { get; set; }
        public int QuizQuestionId { get; set; }
        public List<int> SelectedOptionIds { get; set; } = new List<int>();
        public bool IsCorrect { get; set; }
        public int TimeSpent { get; set; } // in seconds
        public DateTime AnsweredAt { get; set; }
    }
}
