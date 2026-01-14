using OnlineClassroomManagement.Models.Entities;
using System.Security.Claims;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface ICurrentUserService
    {
        Task<User?> GetCurrentUserInfo();
    }
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IRepository _repository;
        public CurrentUserService(IHttpContextAccessor httpContextAccessor, IRepository repository)
        {
            _httpContextAccessor = httpContextAccessor;
            _repository = repository;
        }
        public async Task<User?> GetCurrentUserInfo()
        {
            string? userIdStr = _httpContextAccessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (int.TryParse(userIdStr, out var userId))
            {
                User? user = await _repository.GetAsync<User>(e => e.Id == userId);

                return user;
            }

            return null;
        }
    }
}
