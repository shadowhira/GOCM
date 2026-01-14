namespace OnlineClassroomManagement.Models.Requests.AssignmentGroups
{
    public class CreateAssignmentGroupInvitationRequest
    {
        public int FromMemberId { get; set; }
        public int ToMemberId { get; set; }
    }
}