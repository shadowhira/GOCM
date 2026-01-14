namespace OnlineClassroomManagement.Models.Entities
{
    public class AssignmentGroupMember
    {
        public int Id { get; set; }
        public ClassMember Member { get; set; }
        public bool IsLeader { get; set; }
        public DateTime JoinedAt { get; set; }
    }
}