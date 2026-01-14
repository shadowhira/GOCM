using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Quizs
{
    public class QuizQuestionResponse
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public QuestionType QuestionType { get; set; }
        public double Point { get; set; }
        public List<QuizOptionResponse> Options { get; set; } = new List<QuizOptionResponse>();
        // Note: Answer is intentionally excluded to prevent answer leakage
    }
}