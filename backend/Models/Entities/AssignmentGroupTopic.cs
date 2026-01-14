namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentGroupTopic
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int MaxGroupsPerTopic { get; set; }
        public string? Description { get; set; }
        public int MaxMembers { get; set; } 
        public int MinMembers { get; set; } 
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<AssignmentGroup> AssignmentGroups { get; set; } = new();
        public List<AssignmentGroupApprovalRequest> ApprovalRequests { get; set; } = new();
    }
}