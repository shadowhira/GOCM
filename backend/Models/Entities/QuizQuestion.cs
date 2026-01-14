using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class QuizQuestion
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public QuestionType QuestionType { get; set; }
        public double Point { get; set; }
        public List<QuizOption> Options { get; set; } = new List<QuizOption>();
        public List<QuizAnswer> Answers { get; set; }
    }
}
