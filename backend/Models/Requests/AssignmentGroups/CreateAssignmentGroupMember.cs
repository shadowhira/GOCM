using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Models.Requests.AssignmentGroups
{
    public class CreateAssignmentGroupMemberRequest
    {
        public int MemberId { get; set; }
        public bool IsLeader { get; set; }
    }
}