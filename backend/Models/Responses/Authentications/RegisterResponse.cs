using OnlineClassroomManagement.Models.Responses.Users;

namespace OnlineClassroomManagement.Models.Responses.Authentications
{
  public class RegisterResponse
  {
    public string Message { get; set; }
    public string Token { get; set; } // Đăng nhập luôn sau khi đăng ký
    public UserResponse User { get; set; }
  }
}