using Common.Exceptions;
using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Requests.Authentications;
using OnlineClassroomManagement.Models.Responses.Authentications;
using OnlineClassroomManagement.Services;

namespace OnlineClassroomManagement.Controllers
{
    [ApiController]
    [ApiExceptionFilter]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private IAuthenticationService _authenService;
        public AuthenticationController(IAuthenticationService authenticationService)
        {
            _authenService = authenticationService;
        }

        [HttpPost("login")]
        public async Task<LoginResponse> Login([FromBody] LoginRequest request)
        {
            return await _authenService.ValidateUser(request);
        }

        [HttpPost("register")]
        public async Task<RegisterResponse> Register([FromBody] RegisterRequest request)
        {
            return await _authenService.RegisterUser(request);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _authenService.RequestPasswordResetAsync(request);
            return Ok(new { message = "Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            await _authenService.ResetPasswordAsync(request);
            return Ok(new { message = "Đặt lại mật khẩu thành công!" });
        }
    }
}
