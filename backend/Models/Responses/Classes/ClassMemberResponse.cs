using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Classes
{
    public class ClassMemberResponse
    {
        public int Id { get; set; }
        public int Points { get; set; }
        public string RoleInClass { get; set; } = string.Empty;
        public RoleInClass RoleInClassValue { get; set; }
        public DateTime EnrollDate { get; set; }
        // User Info
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
        public ClassMemberCosmeticSlotsResponse? Cosmetics { get; set; }
    }
}