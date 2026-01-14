using AutoMapper;
using Common.Exceptions;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Users;
using OnlineClassroomManagement.Models.Responses.Users;
using OnlineClassroomManagement.Models.Responses.Storage;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IUserService
    {
        public Task<List<UserResponse>> GetAllUser();
        public Task<PaginatedList<UserResponse>> GetListUser(GetPaginatedUsersRequest request);
        public Task<User> GetUserById(int id);
        public Task CreateUser(CreateUserRequest request);
        public Task UpdateUser(UpdateUserRequest request);
        public Task<UserResponse> UpdateUserProfile(UpdateUserProfileRequest request);
        public Task ChangePassword(ChangePasswordRequest request);
        public Task<UploadAvatarResponse> UploadUserAvatarAsync(IFormFile file);
        public Task<UploadAvatarResponse> UploadUserAvatarByAdminAsync(int userId, IFormFile file);
        public Task DeleteUser(int id);
    }


    public class UserService : IUserService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IStorageService _storageService;

        public UserService(IRepository repository, IMapper mapper, ICurrentUserService currentUserService, IStorageService storageService)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _storageService = storageService;
        }
        public async Task<List<UserResponse>> GetAllUser()
        {

            Specification<User> spec = new();
            spec.Conditions.Add(e => e.Role == Helper.Constants.Role.Admin);

            List<User> users = await _repository.GetListAsync(spec);
            return _mapper.Map<List<UserResponse>>(users);
        }
        public async Task<PaginatedList<UserResponse>> GetListUser(GetPaginatedUsersRequest request)
        {
            // Chú ý: Không dùng phân trang thì dùng Specification<User>
            PaginationSpecification<User> paginationSpecification = new PaginationSpecification<User>();

            if (!string.IsNullOrEmpty(request.DisplayName))
            {
                paginationSpecification.Conditions.Add(e => e.DisplayName.ToLower().Contains(request.DisplayName.ToLower()));
            }

            paginationSpecification.PageSize = request.PageSize;
            paginationSpecification.PageIndex = request.PageNumber;

            PaginatedList<UserResponse> response = await _repository.GetListAsync<User, UserResponse>(paginationSpecification, e => _mapper.Map<UserResponse>(e));

            //PaginatedList<UserResponse> response = new PaginatedList<UserResponse>(_mapper.Map<List<UserResponse>>(users.Items), users.TotalItems, users.PageIndex, users.PageSize);

            return _mapper.Map<PaginatedList<UserResponse>>(response);
        }

        public async Task CreateUser(CreateUserRequest request)
        {
            // Kiểm tra quyền Admin
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null || currentUser.Role != Helper.Constants.Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ Admin mới có thể tạo user");
            }

            // Validate các kiểu
            // Ví dụ: Kiểm tra email đã tồn tại chưa
            bool emailExists = await _repository.ExistsAsync<User>(u => u.Email == request.Email);

            if (emailExists)
            {
                throw new CustomException(ExceptionCode.Duplicate, "Email đã tồn tại");
            }

            // Map sang entity
            User user = _mapper.Map<User>(request);
            _repository.Add(user);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateUser(UpdateUserRequest request)
        {
            // Kiểm tra quyền Admin
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null || currentUser.Role != Helper.Constants.Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ Admin mới có thể cập nhật user");
            }

            // Validate các kiểu

            Specification<User> specification = new Specification<User>();

            specification.Conditions.Add(e => e.Id == request.Id);


            User user = await _repository.GetAsync(specification);
            _mapper.Map(request, user);

            _repository.Update(user);
            await _repository.SaveChangesAsync();
        }

        public async Task<UserResponse> UpdateUserProfile(UpdateUserProfileRequest request)
        {
            // Lấy userId từ context 
            User? user = await _currentUserService.GetCurrentUserInfo();
            if (user == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "User không hợp lệ");
            }
            int userId = user.Id;

            // Validate email không trùng với user khác (chỉ khi có email trong request)
            if (!string.IsNullOrEmpty(request.Email))
            {
                bool emailExists = await _repository.ExistsAsync<User>(u => u.Email == request.Email && u.Id != userId);

                if (emailExists)
                {
                    throw new CustomException(ExceptionCode.Duplicate, "Email đã tồn tại");
                }
            }

            if (!string.IsNullOrEmpty(request.DisplayName))
            {
                user.DisplayName = request.DisplayName;
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                user.Email = request.Email;
            }

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return _mapper.Map<UserResponse>(user);
        }

        public async Task ChangePassword(ChangePasswordRequest request)
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu hiện tại không được để trống!");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu mới không được để trống!");
            }

            if (request.NewPassword.Length < 6)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu mới phải có ít nhất 6 ký tự!");
            }

            // Get current user
            User? user = await _currentUserService.GetCurrentUserInfo();
            if (user == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "User không hợp lệ");
            }

            // Verify current password
            if (!string.Equals(user.Password, request.CurrentPassword, StringComparison.Ordinal))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu hiện tại không đúng!");
            }

            // Don't allow same password
            if (string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Mật khẩu mới không được trùng với mật khẩu hiện tại!");
            }

            // Update password
            user.Password = request.NewPassword;
            _repository.Update(user);
            await _repository.SaveChangesAsync();
        }

        public async Task<UploadAvatarResponse> UploadUserAvatarAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "File upload không hợp lệ");
            }

            User? user = await _currentUserService.GetCurrentUserInfo();
            if (user == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "User không hợp lệ");
            }

            string folder = $"user-{user.Id}";
            StorageUploadResponse uploadResult = await _storageService.UploadFileAsync(file, Buckets.Avatars, folder);

            user.AvatarUrl = uploadResult.PublicUrl ?? string.Empty;

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return new UploadAvatarResponse
            {
                AvatarUrl = user.AvatarUrl
            };
        }

        public async Task<UploadAvatarResponse> UploadUserAvatarByAdminAsync(int userId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "File upload không hợp lệ");
            }

            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null || currentUser.Role != Helper.Constants.Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ Admin mới có quyền cập nhật avatar của user khác");
            }

            Specification<User> spec = new();
            spec.Conditions.Add(u => u.Id == userId);

            User? targetUser = await _repository.GetAsync(spec) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user");

            if (!string.IsNullOrEmpty(targetUser.AvatarUrl))
            {
                string? filePath = _storageService.ExtractFilePathFromUrl(targetUser.AvatarUrl, Buckets.Avatars);
                if (!string.IsNullOrEmpty(filePath))
                {
                    try
                    {
                        await _storageService.DeleteFileAsync(filePath, Buckets.Avatars);
                    }
                    catch
                    {
                        // Ignore storage cleanup failure to proceed with new upload
                    }
                }
            }

            string folder = $"user-{targetUser.Id}";
            StorageUploadResponse uploadResult = await _storageService.UploadFileAsync(file, Buckets.Avatars, folder);

            targetUser.AvatarUrl = uploadResult.PublicUrl ?? string.Empty;

            _repository.Update(targetUser);
            await _repository.SaveChangesAsync();

            return new UploadAvatarResponse
            {
                AvatarUrl = targetUser.AvatarUrl
            };
        }

        public async Task<User> GetUserById(int id)
        {
            Specification<User> spec = new();
            spec.Conditions.Add(e => e.Id == id);

            User? user = await _repository.GetAsync(spec);

            if (user == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user");
            }

            return user;
        }

        public async Task DeleteUser(int id)
        {
            // Kiểm tra quyền Admin
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null || currentUser.Role != Helper.Constants.Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ Admin mới có thể xóa user");
            }

            // Không cho phép xóa chính mình
            if (currentUser.Id == id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Không thể xóa tài khoản của chính mình");
            }

            Specification<User> spec = new();
            spec.Conditions.Add(e => e.Id == id);

            User? user = await _repository.GetAsync(spec) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user");

            // Xóa avatar trên storage nếu có
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                string? filePath = _storageService.ExtractFilePathFromUrl(user.AvatarUrl, Buckets.Avatars);
                if (!string.IsNullOrEmpty(filePath))
                {
                    try
                    {
                        await _storageService.DeleteFileAsync(filePath, Buckets.Avatars);
                    }
                    catch
                    {
                        // Log lỗi nếu cần, nhưng vẫn tiếp tục xóa user
                    }
                }
            }

            _repository.Remove(user);
            await _repository.SaveChangesAsync();
        }
    }
}
