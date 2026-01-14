namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentInClass
    {
        public int Id { get; set; }
        public Assignment Assignment { get; set; }
        public Class Class { get; set; }
        public List<AssignmentGroup> AssignmentGroups { get; set; } = new();
        public List<AssignmentGroupTopic> AssignmentGroupTopics { get; set; } = new();
        public List<Submission> Submissions { get; set; } = new();

    }
}