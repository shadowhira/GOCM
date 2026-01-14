using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class GradeResponse
    {
        public int Id { get; set; }
        public double Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime GradedAt { get; set; }
        public int? GradedById { get; set; } // Chỉ trả về ID thay vì full ClassMember
    }
}