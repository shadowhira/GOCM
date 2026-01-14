using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.Admin;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAdminService
    {
        Task<AdminOverviewResponse> GetAdminOverview();
    }

    public class AdminService : IAdminService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;

        public AdminService(
            IRepository repository,
            ICurrentUserService currentUserService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
        }

        public async Task<AdminOverviewResponse> GetAdminOverview()
        {
            // Kiểm tra quyền Admin
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null || currentUser.Role != Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ Admin mới có thể xem thống kê");
            }

            // Đếm số lượng users
            int totalUsers = await _repository.GetCountAsync<User>();
            
            // Đếm số lượng classes
            int totalClasses = await _repository.GetCountAsync<Class>();
            
            // Đếm số lượng shop items
            int totalShopItems = await _repository.GetCountAsync<ShopItem>();
            
            // New stats
            int totalAssignments = await _repository.GetCountAsync<Assignment>();
            int totalSubmissions = await _repository.GetCountAsync<Submission>();
            int totalPosts = await _repository.GetCountAsync<Post>();
            
            // Active live rooms (NotStarted or InProgress)
            int activeLiveRooms = await _repository.GetCountAsync<LiveRoom>(
                lr => lr.Status == LiveRoomStatus.NotStarted || lr.Status == LiveRoomStatus.InProgress
            );

            return new AdminOverviewResponse
            {
                TotalUsers = totalUsers,
                TotalClasses = totalClasses,
                TotalShopItems = totalShopItems,
                TotalAssignments = totalAssignments,
                TotalSubmissions = totalSubmissions,
                TotalPosts = totalPosts,
                ActiveLiveRooms = activeLiveRooms
            };
        }
    }
}
