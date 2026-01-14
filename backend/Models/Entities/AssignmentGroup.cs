using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentGroup
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public AssignmentGroupStatus Status { get; set; }
        public List<AssignmentGroupMember> GroupMembers { get; set; } = new();
        public List<AssignmentGroupInvitation> GroupInvitations { get; set; } = new();
        public List<AssignmentGroupApprovalRequest> ApprovalRequests { get; set; } = new();
    }
}