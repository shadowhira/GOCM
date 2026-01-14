using OnlineClassroomManagement.Models.Responses.Users;

namespace OnlineClassroomManagement.Models.Responses.Authentications
{
    public class LoginResponse
    {
        public string Token { get; set; }
        public UserResponse User { get; set; }
    }
}
