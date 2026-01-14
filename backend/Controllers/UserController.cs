using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Users;
using OnlineClassroomManagement.Models.Responses.Users;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    public class UserController : ApiControllerBase
    {
        private readonly IUserService _userservice;
        public UserController(IUserService userService)
        {
            _userservice = userService;
        }
        // GET api/User/All
        [HttpGet("All")]
        public async Task<List<UserResponse>> GetAllUsers()
        {
            return await _userservice.GetAllUser();
        }

        // GET api/User/List
        [HttpGet("List")]
        public async Task<PaginatedList<UserResponse>> GetListUser([FromQuery] GetPaginatedUsersRequest request)
        {
            return await _userservice.GetListUser(request);
        }
        // GET api/User/{id}
        [HttpGet("{id}")]
        public Task<User> GetUserById(int id)
        {
            return _userservice.GetUserById(id);
        }

        // POST api/User
        [HttpPost]
        public async Task CreateUser([FromBody] CreateUserRequest request)
        {
            await _userservice.CreateUser(request);
        }
        // PUT api/User/{id}
        [HttpPut()]
        public async Task UpdateUser([FromBody] UpdateUserRequest request)
        {
            await _userservice.UpdateUser(request);
        }

        // PATCH api/User/me
        [HttpPatch("me")]
        public async Task<UserResponse> UpdateUserProfile([FromBody] UpdateUserProfileRequest request)
        {
            return await _userservice.UpdateUserProfile(request);
        }

        // POST api/User/me/change-password
        [HttpPost("me/change-password")]
        public async Task ChangePassword([FromBody] ChangePasswordRequest request)
        {
            await _userservice.ChangePassword(request);
        }

        // POST api/User/me/avatar
        [HttpPost("me/avatar")]
        [Consumes("multipart/form-data")]
        public async Task<UploadAvatarResponse> UploadAvatar([FromForm] UploadAvatarRequest request)
        {
            return await _userservice.UploadUserAvatarAsync(request.File);
        }

        // POST api/User/{id}/avatar
        [HttpPost("{id}/avatar")]
        [Consumes("multipart/form-data")]
        public async Task<UploadAvatarResponse> UploadAvatarForUser(int id, [FromForm] UploadAvatarRequest request)
        {
            return await _userservice.UploadUserAvatarByAdminAsync(id, request.File);
        }

        // DELETE api/User/{id}
        [HttpDelete("{id}")]
        public async Task DeleteUser(int id)
        {
            await _userservice.DeleteUser(id);
        }
    }
}
