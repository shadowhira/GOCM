using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Users
{
    public class CreateUserRequest
    {
        public string AvatarUrl { get; set; }
        public string DisplayName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public Role Role { get; set; }
    }
}
