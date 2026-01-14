
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;

namespace OnlineClassroomManagement.Models.Responses.AssignmentGroups
{
    public class AssignmentGroupResponse
    {
        public int Id { get; set; }
        public int? AssignmentGroupTopicId { get; set; }
        public string Name { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public AssignmentGroupStatus Status { get; set; }
        public List<AssignmentGroupMemberResponse> GroupMembers { get; set; } = new();
        public List<AssignmentGroupInvitationResponse> GroupInvitations { get; set; } = new();
        public List<AssignmentGroupApprovalRequestResponse> ApprovalRequests { get; set; } = new();
    }
}