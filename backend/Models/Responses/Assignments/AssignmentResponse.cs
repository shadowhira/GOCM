using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.Quizs;

namespace OnlineClassroomManagement.Models.Responses.Assignments
{
    public class AssignmentResponse
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Content { get; set; }
        public List<AttachmentResponse>? Attachments { get; set; }
        public DateTime Deadline { get; set; }
        public double MaxScore { get; set; }
        public AssignmentType Type { get; set; }
        public List<QuizQuestionResponse>? ListQuestions { get; set; }
        public DateTime CreatedAt { get; set; }
        public AssignmentStatus Status { get; set; }
        public SubmissionStatus? SubmissionStatus { get; set; }
        public bool AllowShowResultToStudent { get; set; }
    }
}