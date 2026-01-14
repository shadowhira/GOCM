namespace OnlineClassroomManagement.Models.Entities
{
    public class Grade
    {
        public int Id { get; set; }
        public double Score { get; set; }
        public string? Feedback { get; set; }
        public DateTime GradedAt { get; set; }
        public ClassMember GradedBy { get; set; }
    }
}
