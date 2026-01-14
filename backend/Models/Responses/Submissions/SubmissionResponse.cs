using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.Grades;

namespace OnlineClassroomManagement.Models.Responses.Submissions
{
    public class SubmissionResponse
    {
        public int Id { get; set; }
        public int SubmitById { get; set; }
        public string? SubmitByName { get; set; }
        public string? SubmitByAvatarUrl { get; set; }
        public string? SubmitByEmail { get; set; }
        public DateTime? SubmittedTime { get; set; }
        public string? Content { get; set; }
        public List<AttachmentResponse> SubmittedFiles { get; set; } = new();
        public SubmissionStatus Status { get; set; } 
        public GradeResponse? Grade { get; set; }
        public List<QuizAnswer> Answers { get; set; } = new();
        public AssignmentGroupResponse? AssignmentGroup { get ; set; }
    }
}