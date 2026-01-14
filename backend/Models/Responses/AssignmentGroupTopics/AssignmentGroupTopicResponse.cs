using OnlineClassroomManagement.Models.Responses.AssignmentGroups;

namespace OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics
{
    public class AssignmentGroupTopicResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int MaxGroupsPerTopic { get; set; }
        public string? Description { get; set; }
        public int MaxMembers { get; set; }
        public int MinMembers { get; set; }
        public List<AssignmentGroupResponse>? AssignmentGroups { get; set; }
        public List<AssignmentGroupApprovalRequestResponse>? ApprovalRequests { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}