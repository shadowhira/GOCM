using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Assignments;
using OnlineClassroomManagement.Models.Requests.Quiz;

namespace OnlineClassroomManagement.Models.Requests.Submissions
{
    public class CreateSubmissionRequest
    {
        // public ClassMember SubmitBy { get; set; }
        // public DateTime? SubmittedTime { get; set; }
        public string? Content { get; set; }
        public List<int> DocumentIds { get; set; } = new();
        // public SubmissionStatus Status { get; set; }
        // public Grade? Grade { get; set; }
        public List<CreateQuizAnswerRequest> Answers { get; set; } = new();
    }
}