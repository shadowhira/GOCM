using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.Quizs;

namespace OnlineClassroomManagement.Models.Responses.Submissions
{
    public class CreateSubmissionResponse
    {
        public int Id { get; set; }
        public int SubmitById { get; set; }
        public DateTime? SubmittedTime { get; set; }
        public string? Content { get; set; }
        public List<AttachmentResponse> SubmittedFiles { get; set; } = new();
        public SubmissionStatus Status { get; set; }
        public List<QuizAnswerResponse> Answers { get; set; }
        public AssignmentGroupResponse? AssignmentGroup { get ; set; }
        // Không có Grade  để bảo mật
    }
}