using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Models.Requests.Quizs
{
    public class UpdateQuizQuestionRequest
    {
        public int Id { get; set; } // 0 = new question, >0 = update existing question
        public string QuestionText { get; set; } = string.Empty;
        public QuestionType QuestionType { get; set; }
        public double Point { get; set; }
        public List<QuizOption> Options { get; set; } = new();
    }
}