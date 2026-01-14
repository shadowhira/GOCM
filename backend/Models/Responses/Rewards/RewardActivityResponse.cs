using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Rewards
{
    public class RewardActivityResponse
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public int TargetUserId { get; set; }
        public string TargetUserName { get; set; } = string.Empty;
        public ActivityType ActivityType { get; set; }
        public int Points { get; set; }
        public ParentType? ParentType { get; set; }
        public int? ParentId { get; set; }
        public string? Reason { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
