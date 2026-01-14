using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics;

namespace OnlineClassroomManagement.Models.Responses.AssignmentGroups
{
    public class AssignmentGroupApprovalRequestResponse
    {
        public int Id { get; set; }
        public AssignmentGroupApprovalStatus Status { get; set; }
        public AssignmentGroupResponse AssignmentGroup { get; set; }
        public AssignmentGroupTopicResponse AssignmentGroupTopic { get; set; }
        public string? RejectReason { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}