using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Users
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string AvatarUrl { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public Role Role { get; set; }
    }
}
