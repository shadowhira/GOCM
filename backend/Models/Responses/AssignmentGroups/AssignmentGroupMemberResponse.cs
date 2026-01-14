using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Models.Responses.AssignmentGroups
{
    public class AssignmentGroupMemberResponse
    {
        public int Id { get; set; }
        public ClassMemberResponse Member { get; set; } = new();
        public bool IsLeader { get; set; }
        public DateTime JoinedAt { get; set; }
    }
}