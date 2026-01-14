using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentGroupInvitation
    {
        public int Id { get; set; }
        public ClassMember FromMember { get; set; }
        public ClassMember ToMember { get; set; }
        public AssignmentGroupInvitationStatus Status { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}