using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Quizs
{
    public class CreateQuizQuestionRequest
    {
        public string QuestionText { get; set; } = string.Empty;

        public QuestionType QuestionType { get; set; }

        public double Point { get; set; }

        public List<CreateQuizOptionRequest> Options { get; set; } = new();
    }
}