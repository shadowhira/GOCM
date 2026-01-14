namespace OnlineClassroomManagement.Models.Requests.Quizs
{
    public class CreateQuizOptionRequest
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}