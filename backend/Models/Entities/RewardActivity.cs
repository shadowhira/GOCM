using System.Diagnostics;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class RewardActivity
    {
        public int Id { get; set; }
        public User User { get; set; }
        public Class Class { get; set; }
        public ActivityType Type { get; set; }
        public int TotalEarnedPoints { get; set; }
        public ParentType? ParentType { get; set; }
        public int? ParentId { get; set; }
        public string? Reason { get; set; }
        public ClassMember? GrantedBy { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
