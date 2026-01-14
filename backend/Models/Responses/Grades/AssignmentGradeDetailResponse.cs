namespace OnlineClassroomManagement.Models.Responses.Grades
{
    public class AssignmentGradeDetailResponse
    {
        public int AssignmentId { get; set; }
        public string AssignmentTitle { get; set; } = string.Empty;
        public string AssignmentType { get; set; } = string.Empty;
        public decimal MaxScore { get; set; }
        public DateTime? DueDate { get; set; }
        public List<StudentGradeResponse> StudentGrades { get; set; } = new();
    }
}
