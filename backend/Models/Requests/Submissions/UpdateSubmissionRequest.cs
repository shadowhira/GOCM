using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Assignments;
using OnlineClassroomManagement.Models.Requests.Quiz;

namespace OnlineClassroomManagement.Models.Requests.Submissions
{
    public class UpdateSubmissionRequest
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public List<int> DocumentIds { get; set; } = new();
    }
}