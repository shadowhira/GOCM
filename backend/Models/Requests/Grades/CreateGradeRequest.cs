using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Models.Requests.Grades
{
    public class CreateGradeRequest
    {
        public double Score { get; set; }
        public string? Feedback { get; set; }
    }
}