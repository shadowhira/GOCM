using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Models.Responses.AssignmentGroups
{
    public class AssignmentGroupInvitationResponse
    {
        public int Id { get; set; }
        public ClassMemberResponse FromMember { get; set; }
        public ClassMemberResponse ToMember { get; set; }
        public AssignmentGroupInvitationStatus Status { get; set; }
        public DateTime SentAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}