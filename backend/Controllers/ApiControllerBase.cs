using Common.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace OnlineClassroomManagement.Controllers
{
    [ApiController]
    [ApiExceptionFilter] // Xử lý Exception khi quăng exception, FE chú ý định dạng gửi về để xử lý lỗi
    [Authorize]
    [Route("api/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        // Khi tạo controller, kế thừa từ class này, ngoại trừ api login, đăng ký!
    }
}
