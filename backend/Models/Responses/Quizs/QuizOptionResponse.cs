namespace OnlineClassroomManagement.Models.Responses.Quizs
{
    public class QuizOptionResponse
    {
        public int Id { get; set; }
        public string OptionText { get; set; } = string.Empty;
        // Note: IsCorrect is intentionally excluded to prevent answer leakage
    }
}