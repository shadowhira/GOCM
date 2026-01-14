using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentGroupApprovalRequest
    {
        public int Id { get; set; }
        public AssignmentGroupApprovalStatus Status { get; set; }
        public string? RejectReason { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}