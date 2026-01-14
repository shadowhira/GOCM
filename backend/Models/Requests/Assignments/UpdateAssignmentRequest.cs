
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Requests.Quizs;

namespace OnlineClassroomManagement.Models.Requests.Assignments
{
    public class UpdateAssignmentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public List<int>? AttachedDocumentIds { get; set; }
        public DateTime Deadline { get; set; }
        public double MaxScore { get; set; }
        public AssignmentType Type { get; set; }
        public List<UpdateQuizQuestionRequest>? ListQuestions { get; set; }
    }
}