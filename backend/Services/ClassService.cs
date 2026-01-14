using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Utilities;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Classes;
using OnlineClassroomManagement.Models.Responses.Classes;
using OnlineClassroomManagement.Models.Responses.Storage;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IClassService
    {
        public Task<List<ClassResponse>> GetAllClasses();
        public Task<PaginatedList<ClassResponse>> GetListClasses(GetPaginatedClassesRequest request);
        public Task<ClassResponse> GetClassById(int id);
        public Task<List<ClassResponse>> GetMyClasses();
        public Task<ClassResponse> CreateClass(CreateClassRequest request);
        public Task UpdateClass(int id, UpdateClassRequest request);
        public Task DeleteClass(int id);
        public Task<ClassResponse> JoinClass(JoinClassRequest request);
        public Task LeaveClass(int classId);
        public Task<List<ClassMemberResponse>> GetClassMembers(int classId);
        public Task<ClassMemberResponse> UpdateClassMember(int classId, int memberId, UpdateClassMemberRequest request);
        public Task RemoveMember(int classId, int memberId);
        public Task<List<ClassShopItemResponse>> GetClassShopItems(int classId);
        public Task<List<ClassMemberCosmeticResponse>> GetClassCosmetics(int classId);
        public Task<ClassMemberCosmeticResponse> EquipClassCosmetic(int classId, EquipClassCosmeticRequest request);
        public Task<List<ClassShopItemResponse>> AddShopItemsToClass(int classId, AddClassShopItemsRequest request);
        public Task RemoveShopItemFromClass(int classId, int classShopItemId);
        public Task<PurchaseShopItemResponse> PurchaseShopItem(int classId, int shopItemId);
        public Task<ClassAppearanceSettingsResponse> GetClassAppearanceSettings(int classId);
        public Task<ClassAppearanceSettingsResponse> UpdateClassAppearanceSettings(int classId, UpdateClassAppearanceSettingsRequest request);
        public Task<UploadClassCoverResponse> UploadClassCover(int classId, IFormFile file);
        public Task InviteToClass(int classId, InviteToClassRequest request);
    }

    public class ClassService : IClassService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IStorageService _storageService;
        private readonly INotificationService _notificationService;

        public ClassService(IRepository repository, IMapper mapper, ICurrentUserService currentUserService, IStorageService storageService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _storageService = storageService;
            _notificationService = notificationService;
        }

        public async Task<List<ClassResponse>> GetAllClasses()
        {
            Specification<Class> spec = new();
            spec.Includes = ep => ep.Include(c => c.AppearanceSettings);
            List<Class> classes = await _repository.GetListAsync(spec);
            List<ClassResponse> responses = _mapper.Map<List<ClassResponse>>(classes);
            for (int i = 0; i < classes.Count; i++)
            {
                responses[i].AppearanceSettings = MapAppearanceSettings(classes[i].AppearanceSettings);
            }

            return responses;
        }

        public async Task<PaginatedList<ClassResponse>> GetListClasses(GetPaginatedClassesRequest request)
        {
            PaginationSpecification<Class> paginationSpecification = new PaginationSpecification<Class>();
            paginationSpecification.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.AppearanceSettings);

            // Filter by ClassName if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                paginationSpecification.Conditions.Add(e => e.Name.ToLower().Contains(request.Name.ToLower()));
            }

            // Get current user for OnlyMine filter and pending assignments
            User? currentUser = await _currentUserService.GetCurrentUserInfo();

            // Filter only classes of current user when requested
            if (request.OnlyMine == true && currentUser != null)
            {
                paginationSpecification.Conditions.Add(e => e.Members.Any(m => m.User != null && m.User.Id == currentUser.Id));
            }

            paginationSpecification.PageSize = request.PageSize;
            paginationSpecification.PageIndex = request.PageNumber;

            PaginatedList<Class> paginatedClasses = await _repository.GetListAsync(paginationSpecification);
            List<ClassResponse> responses = _mapper.Map<List<ClassResponse>>(paginatedClasses.Items);

            // Get pending assignments data for all classes at once (only when OnlyMine and user is student)
            var classIds = paginatedClasses.Items.Select(c => c.Id).ToList();
            var now = DateTime.UtcNow;
            List<AssignmentInClass> assignmentsInClasses = new();
            
            if (request.OnlyMine == true && currentUser != null)
            {
                // Get all assignments in these classes with submissions
                Specification<AssignmentInClass> assignmentSpec = new();
                assignmentSpec.Conditions.Add(aic => classIds.Contains(aic.Class.Id));
                assignmentSpec.Conditions.Add(aic => aic.Assignment.Deadline > now); // Only future deadlines
                assignmentSpec.Conditions.Add(aic => aic.Assignment.Status == AssignmentStatus.Assigned);
                assignmentSpec.Includes = ep => ep
                    .Include(aic => aic.Assignment)
                    .Include(aic => aic.Class)
                    .Include(aic => aic.Submissions).ThenInclude(s => s.SubmitBy).ThenInclude(sb => sb.User);
                
                assignmentsInClasses = await _repository.GetListAsync(assignmentSpec);
            }
            
            // Map additional fields
            for (int i = 0; i < paginatedClasses.Items.Count; i++)
            {
                responses[i].CreatedByUserId = paginatedClasses.Items[i].CreatedByUser.Id;
                responses[i].CreatedByUserName = paginatedClasses.Items[i].CreatedByUser.DisplayName;
                responses[i].CreatedByUserAvatarUrl = paginatedClasses.Items[i].CreatedByUser.AvatarUrl;
                responses[i].MemberCount = paginatedClasses.Items[i].Members.Count;
                responses[i].AppearanceSettings = MapAppearanceSettings(paginatedClasses.Items[i].AppearanceSettings);

                // Set user's role in class if current user is a member
                if (request.OnlyMine == true && currentUser != null)
                {
                    var userMember = paginatedClasses.Items[i].Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
                    if (userMember != null)
                    {
                        responses[i].UserRoleInClass = userMember.RoleInClass;
                        
                        // Only calculate pending assignments for students
                        if (userMember.RoleInClass == RoleInClass.Student)
                        {
                            var classAssignments = assignmentsInClasses
                                .Where(aic => aic.Class.Id == paginatedClasses.Items[i].Id)
                                .ToList();
                            
                            // Count assignments where user hasn't submitted
                            var pendingCount = classAssignments.Count(aic => 
                                !aic.Submissions.Any(s => s.SubmitBy.User.Id == currentUser.Id));
                            
                            responses[i].PendingAssignmentsCount = pendingCount;
                            
                            // Get next deadline (earliest deadline among pending assignments)
                            var nextDeadline = classAssignments
                                .Where(aic => !aic.Submissions.Any(s => s.SubmitBy.User.Id == currentUser.Id))
                                .OrderBy(aic => aic.Assignment.Deadline)
                                .FirstOrDefault()?.Assignment.Deadline;
                            
                            responses[i].NextDeadline = nextDeadline;
                        }
                    }
                }
            }

            return new PaginatedList<ClassResponse>(responses, paginatedClasses.TotalItems, paginatedClasses.PageIndex, paginatedClasses.PageSize);
        }

        public async Task<ClassResponse> GetClassById(int id)
        {
            Specification<Class> spec = new();
            spec.Conditions.Add(e => e.Id == id);
            spec.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.AppearanceSettings);
            Class? classEntity = await _repository.GetAsync(spec);

            ClassResponse response = _mapper.Map<ClassResponse>(classEntity);

            // Populate additional fields
            response.CreatedByUserId = classEntity.CreatedByUser.Id;
            response.CreatedByUserName = classEntity.CreatedByUser.DisplayName;
            response.CreatedByUserAvatarUrl = classEntity.CreatedByUser.AvatarUrl;
            response.MemberCount = classEntity.Members.Count;
            response.AppearanceSettings = MapAppearanceSettings(classEntity.AppearanceSettings);

            // Set user's role in class
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser != null)
            {
                var userMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
                if (userMember != null)
                {
                    response.UserRoleInClass = userMember.RoleInClass;
                }
            }
            return response;
        }

        public async Task<List<ClassResponse>> GetMyClasses()
        {
            // Get current user
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            // Get all classes that contain this user as a member
            Specification<Class> spec = new();
            spec.Conditions.Add(e => e.Members.Any(m => m.User.Id == currentUser.Id));
            spec.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.AppearanceSettings);

            List<Class> classes = await _repository.GetListAsync(spec);
            List<ClassResponse> responses = _mapper.Map<List<ClassResponse>>(classes);

            // Get pending assignments data for all classes at once
            var classIds = classes.Select(c => c.Id).ToList();
            var now = DateTime.UtcNow;
            
            // Get all assignments in these classes with submissions
            Specification<AssignmentInClass> assignmentSpec = new();
            assignmentSpec.Conditions.Add(aic => classIds.Contains(aic.Class.Id));
            assignmentSpec.Conditions.Add(aic => aic.Assignment.Deadline > now); // Only future deadlines
            assignmentSpec.Conditions.Add(aic => aic.Assignment.Status == AssignmentStatus.Assigned);
            assignmentSpec.Includes = ep => ep
                .Include(aic => aic.Assignment)
                .Include(aic => aic.Class)
                .Include(aic => aic.Submissions).ThenInclude(s => s.SubmitBy).ThenInclude(sb => sb.User);
            
            var assignmentsInClasses = await _repository.GetListAsync(assignmentSpec);

            // Set additional fields for each class
            for (int i = 0; i < classes.Count; i++)
            {
                responses[i].CreatedByUserId = classes[i].CreatedByUser.Id;
                responses[i].CreatedByUserName = classes[i].CreatedByUser.DisplayName;
                responses[i].CreatedByUserAvatarUrl = classes[i].CreatedByUser.AvatarUrl;
                responses[i].MemberCount = classes[i].Members.Count;
                responses[i].AppearanceSettings = MapAppearanceSettings(classes[i].AppearanceSettings);

                // Set user's role in each class
                var userMember = classes[i].Members.FirstOrDefault(m => m.User.Id == currentUser.Id);
                if (userMember != null)
                {
                    responses[i].UserRoleInClass = userMember.RoleInClass;
                    
                    // Only calculate pending assignments for students
                    if (userMember.RoleInClass == RoleInClass.Student)
                    {
                        var classAssignments = assignmentsInClasses
                            .Where(aic => aic.Class.Id == classes[i].Id)
                            .ToList();
                        
                        // Count assignments where user hasn't submitted
                        var pendingCount = classAssignments.Count(aic => 
                            !aic.Submissions.Any(s => s.SubmitBy.User.Id == currentUser.Id));
                        
                        responses[i].PendingAssignmentsCount = pendingCount;
                        
                        // Get next deadline (earliest deadline among pending assignments)
                        var nextDeadline = classAssignments
                            .Where(aic => !aic.Submissions.Any(s => s.SubmitBy.User.Id == currentUser.Id))
                            .OrderBy(aic => aic.Assignment.Deadline)
                            .FirstOrDefault()?.Assignment.Deadline;
                        
                        responses[i].NextDeadline = nextDeadline;
                    }
                }
            }

            return responses;
        }

        public async Task<ClassResponse> CreateClass(CreateClassRequest request)
        {
            // Get current user
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            // Generate unique join code
            string joinCode = GenerateJoinCode();
            while (await _repository.ExistsAsync<Class>(c => c.JoinCode == joinCode))
            {
                joinCode = GenerateJoinCode();
            }

            // Create class using mapper
            Class classEntity = _mapper.Map<Class>(request);
            classEntity.JoinCode = joinCode;
            classEntity.CreatedByUser = currentUser;
            classEntity.CreatedAt = DateTime.UtcNow;
            classEntity.Members = new List<ClassMember>();
            classEntity.AppearanceSettings = new ClassAppearanceSettings
            {
                Class = classEntity,
                ShowAvatarFrames = true,
                ShowChatFrames = true,
                ShowBadges = true,
                UpdatedAt = DateTime.UtcNow
            };

            // Add creator as teacher
            ClassMember creatorMember = new ClassMember
            {
                User = currentUser,
                RoleInClass = RoleInClass.Teacher,
                EnrollDate = DateTime.UtcNow,
                Points = 0
            };
            classEntity.Members.Add(creatorMember);
            
            _repository.Add(classEntity);
            await _repository.SaveChangesAsync();

            await AssignDefaultShopItemsToClass(classEntity);

            // Map response
            ClassResponse response = _mapper.Map<ClassResponse>(classEntity);
            response.CreatedByUserId = currentUser.Id;
            response.CreatedByUserName = currentUser.DisplayName;
            response.CreatedByUserAvatarUrl = currentUser.AvatarUrl;
            response.MemberCount = 1;
            response.UserRoleInClass = RoleInClass.Teacher;
            response.AppearanceSettings = MapAppearanceSettings(classEntity.AppearanceSettings);

            return response;
        }

        public async Task UpdateClass(int id, UpdateClassRequest request)
        {
            Specification<Class> spec = new();
            spec.Conditions.Add(e => e.Id == id);

            Class? classEntity = await _repository.GetAsync(spec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            // Use mapper to update properties
            _mapper.Map(request, classEntity);

            _repository.Update(classEntity);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteClass(int id)
        {
            // Get current user
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            Specification<Class> spec = new();
            spec.Conditions.Add(c => c.Id == id);
            spec.Includes = ep => ep
                .Include(u => u.CreatedByUser)
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Documents)
                .Include(c => c.ShopItemInClasses);

            Class? classEntity = await _repository.GetAsync(spec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            bool isAdmin = currentUser.Role == Role.Admin;

            // Check if user is the creator (teacher) or platform admin
            if (classEntity.CreatedByUser?.Id != currentUser.Id && !isAdmin)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giáo viên tạo lớp mới có thể xóa lớp");
            }
            
            // Remove related assignments
            await RemoveAssignmentsForClass(id);
            // Remove related posts
            await RemovePostsForClass(id);
            // Remove shop items
            if (classEntity.ShopItemInClasses?.Any() == true)
            {
                foreach (ShopItemInClass shopItemInClass in classEntity.ShopItemInClasses.ToList())
                {
                    _repository.Remove(shopItemInClass);
                }
            }
            // Remove documents
            if (classEntity.Documents?.Any() == true)
            {
                foreach (Document document in classEntity.Documents.ToList())
                {
                    _repository.Remove(document);
                }
            }
            // Remove members
            if (classEntity.Members?.Any() == true)
            {
                foreach (ClassMember member in classEntity.Members.ToList())
                {
                    _repository.Remove(member);
                }
            }

            _repository.Remove(classEntity);
            await _repository.SaveChangesAsync();
        }

        private async Task RemoveAssignmentsForClass(int classId)
        {
            Specification<AssignmentInClass> assignmentSpec = new();
            assignmentSpec.Conditions.Add(aic => aic.Class.Id == classId);
            assignmentSpec.Includes = query => query.Include(aic => aic.Assignment);

            List<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(assignmentSpec);
            if (assignmentInClasses.Count == 0)
            {
                return;
            }

            HashSet<int> assignmentIds = assignmentInClasses
                .Where(aic => aic.Assignment != null)
                .Select(aic => aic.Assignment.Id)
                .ToHashSet();

            HashSet<int> assignmentIdsUsedElsewhere = assignmentIds.Count == 0
                ? new HashSet<int>()
                : (await _repository.GetQueryable<AssignmentInClass>()
                    .Where(aic => assignmentIds.Contains(aic.Assignment.Id) && aic.Class.Id != classId)
                    .Select(aic => aic.Assignment.Id)
                    .Distinct()
                    .ToListAsync())
                    .ToHashSet();

            HashSet<int> processedAssignmentIds = new();

            foreach (AssignmentInClass assignmentLink in assignmentInClasses)
            {
                _repository.Remove(assignmentLink);

                if (assignmentLink.Assignment == null)
                {
                    continue;
                }

                int assignmentId = assignmentLink.Assignment.Id;
                if (processedAssignmentIds.Contains(assignmentId))
                {
                    continue;
                }

                processedAssignmentIds.Add(assignmentId);

                if (!assignmentIdsUsedElsewhere.Contains(assignmentId))
                {
                    _repository.Remove(assignmentLink.Assignment);
                }
            }
        }

        private async Task RemovePostsForClass(int classId)
        {
            Specification<PostInClass> postSpec = new();
            postSpec.Conditions.Add(pic => pic.Class.Id == classId);
            postSpec.Includes = query => query.Include(pic => pic.Post);

            List<PostInClass> postLinks = await _repository.GetListAsync(postSpec);
            if (postLinks.Count == 0)
            {
                return;
            }

            HashSet<int> postIds = postLinks
                .Where(pic => pic.Post != null)
                .Select(pic => pic.Post.Id)
                .ToHashSet();

            HashSet<int> postIdsUsedElsewhere = postIds.Count == 0
                ? new HashSet<int>()
                : (await _repository.GetQueryable<PostInClass>()
                    .Where(pic => postIds.Contains(pic.Post.Id) && pic.Class.Id != classId)
                    .Select(pic => pic.Post.Id)
                    .Distinct()
                    .ToListAsync())
                    .ToHashSet();

            HashSet<int> processedPostIds = new();

            foreach (PostInClass postLink in postLinks)
            {
                _repository.Remove(postLink);

                if (postLink.Post == null)
                {
                    continue;
                }

                int postId = postLink.Post.Id;
                if (processedPostIds.Contains(postId))
                {
                    continue;
                }

                processedPostIds.Add(postId);

                if (!postIdsUsedElsewhere.Contains(postId))
                {
                    _repository.Remove(postLink.Post);
                }
            }
        }

        public async Task<ClassResponse> JoinClass(JoinClassRequest request)
        {
            // Get current user
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            // Find class by join code
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(e => e.JoinCode == request.JoinCode);
            classSpec.Includes = ep => ep.Include(c => c.Members).ThenInclude(m => m.User).Include(c => c.CreatedByUser);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Mã lớp học không hợp lệ");
            }

            // Check if user already in class
            bool isAlreadyMember = classEntity.Members.Any(m => m.User.Id == currentUser.Id);
            if (isAlreadyMember)
            {
                throw new CustomException(ExceptionCode.Duplicate, "Bạn đã là thành viên của lớp học này");
            }

            // Add user to class as student
            ClassMember newMember = new ClassMember
            {
                User = currentUser,
                RoleInClass = RoleInClass.Student,
                EnrollDate = DateTime.UtcNow,
                Points = 0
            };

            classEntity.Members.Add(newMember);
            _repository.Update(classEntity);
            await _repository.SaveChangesAsync();

            // Notify teachers/owner that a member joined (no self notification)
            List<int> teacherIds = classEntity.Members
                .Where(m => m.RoleInClass == RoleInClass.Teacher && m.User.Id != currentUser.Id)
                .Select(m => m.User.Id)
                .Distinct()
                .ToList();

            if (classEntity.CreatedByUser?.Id is int ownerId && ownerId != currentUser.Id && !teacherIds.Contains(ownerId))
            {
                teacherIds.Add(ownerId);
            }

            if (teacherIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "class_member_joined",
                    Data = new Dictionary<string, string>
                    {
                        { "userName", currentUser.DisplayName ?? string.Empty },
                        { "className", classEntity.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = teacherIds,
                    LinkRedirect = $"/class/{classEntity.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }

            // Map response
            ClassResponse response = _mapper.Map<ClassResponse>(classEntity);
            response.CreatedByUserId = classEntity.CreatedByUser.Id;
            response.CreatedByUserName = classEntity.CreatedByUser.DisplayName;
            response.MemberCount = classEntity.Members.Count;
            response.UserRoleInClass = RoleInClass.Student;

            return response;
        }

        public async Task LeaveClass(int classId)
        {
            // Get current user
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            // Get the class first
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            // Find the specific member in the class
            ClassMember? member = classEntity.Members?.FirstOrDefault(m => m.User?.Id == currentUser.Id);
            if (member == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Bạn không phải thành viên của lớp học này");
            }

            // Check if user is the class creator
            if (classEntity.CreatedByUser?.Id == currentUser.Id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Giáo viên tạo lớp không thể rời khỏi lớp. Hãy xóa lớp thay vì rời lớp.");
            }

            // Notify teachers/owner that a member left (no self notification)
            List<int> teacherIds = classEntity.Members
                .Where(m => m.RoleInClass == RoleInClass.Teacher && m.User.Id != currentUser.Id)
                .Select(m => m.User.Id)
                .Distinct()
                .ToList();

            if (classEntity.CreatedByUser?.Id is int ownerId && ownerId != currentUser.Id && !teacherIds.Contains(ownerId))
            {
                teacherIds.Add(ownerId);
            }

            if (teacherIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "class_member_left",
                    Data = new Dictionary<string, string>
                    {
                        { "userName", currentUser.DisplayName ?? string.Empty },
                        { "className", classEntity.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = teacherIds,
                    LinkRedirect = $"/class/{classEntity.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }

            // Remove the member from class
            _repository.Remove(member);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<ClassMemberResponse>> GetClassMembers(int classId)
        {
            // Get class with it's members
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(e => e.Id == classId);
            classSpec.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);

            // Use mapper for base mapping
            List<ClassMemberResponse> responses = _mapper.Map<List<ClassMemberResponse>>(classEntity.Members);

            // Manually set RoleInClassValue because AutoMapper might have issues with enum mapping
            for (int i = 0; i < responses.Count; i++)
            {
                responses[i].RoleInClassValue = classEntity.Members.ElementAt(i).RoleInClass;
            }

            return responses;
        }

        public async Task<ClassMemberResponse> UpdateClassMember(int classId, int memberId, UpdateClassMemberRequest request)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(e => e.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.CreatedByUser);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy lớp học với ID {classId}");
            }

            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User.Id == currentUser.Id);
            bool isTeacher = currentMember?.RoleInClass == RoleInClass.Teacher;
            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isAdmin = currentUser.Role == Role.Admin;
            if (!isTeacher && !isOwner && !isAdmin)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giáo viên hoặc người tạo lớp mới có thể chỉnh sửa thành viên");
            }

            ClassMember? memberToUpdate = classEntity.Members.FirstOrDefault(m => m.Id == memberId);
            if (memberToUpdate == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy thành viên với ID {memberId} trong lớp này");
            }

            RoleInClass oldRole = memberToUpdate.RoleInClass;

            if (request.Points < 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Điểm không được nhỏ hơn 0");
            }

            // Không cho phép thay đổi vai trò của người tạo lớp thành học sinh
            if (memberToUpdate.User.Id == classEntity.CreatedByUser.Id && request.RoleInClass != RoleInClass.Teacher)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Không thể thay đổi vai trò của người tạo lớp");
            }

            memberToUpdate.Points = request.Points;
            memberToUpdate.RoleInClass = request.RoleInClass;
            if (request.EnrollDate.HasValue)
            {
                DateTime enrollDateUtc = request.EnrollDate.Value.Kind == DateTimeKind.Unspecified
                    ? DateTime.SpecifyKind(request.EnrollDate.Value, DateTimeKind.Utc)
                    : request.EnrollDate.Value.ToUniversalTime();
                memberToUpdate.EnrollDate = enrollDateUtc;
            }

            _repository.Update(memberToUpdate);
            await _repository.SaveChangesAsync();

            // Notify member when role changes (no self notification)
            if (oldRole != memberToUpdate.RoleInClass && memberToUpdate.User.Id != currentUser.Id)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "class_member_role_updated",
                    Data = new Dictionary<string, string>
                    {
                        { "className", classEntity.Name ?? string.Empty },
                        { "oldRole", oldRole.ToString() },
                        { "newRole", memberToUpdate.RoleInClass.ToString() },
                        { "updatedBy", currentUser.DisplayName ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { memberToUpdate.User.Id },
                    LinkRedirect = $"/class/{classEntity.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }

            ClassMemberResponse response = _mapper.Map<ClassMemberResponse>(memberToUpdate);
            response.RoleInClassValue = memberToUpdate.RoleInClass;
            return response;
        }

        public async Task RemoveMember(int classId, int memberId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            // Lấy thông tin lớp cùng danh sách thành viên để kiểm tra quyền
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(e => e.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members)
                .ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser);

            Class? classEntity = await _repository.GetAsync(classSpec);

            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy lớp học với ID {classId}");
            }

            // Kiểm tra nếu người dùng hiện tại là giáo viên hoặc chủ sở hữu lớp
            ClassMember? currentUserMember = classEntity.Members.FirstOrDefault(m => m.User.Id == currentUser.Id);
            bool isTeacher = currentUserMember?.RoleInClass == RoleInClass.Teacher;
            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isAdmin = currentUser.Role == Role.Admin;

            if (!isTeacher && !isOwner && !isAdmin)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giáo viên hoặc người tạo lớp mới có thể xóa thành viên");
            }

            // Tìm thành viên cần xóa
            ClassMember? memberToRemove = classEntity.Members.FirstOrDefault(m => m.Id == memberId);

            if (memberToRemove == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy thành viên với ID {memberId} trong lớp này");
            }

            // Không cho phép xóa chủ sở hữu lớp
            if (memberToRemove.User.Id == classEntity.CreatedByUser.Id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Không thể xóa người tạo lớp");
            }

            // Notify removed member (no self notification)
            if (memberToRemove.User.Id != currentUser.Id)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "class_member_removed",
                    Data = new Dictionary<string, string>
                    {
                        { "className", classEntity.Name ?? string.Empty },
                        { "removedBy", currentUser.DisplayName ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { memberToRemove.User.Id },
                    LinkRedirect = $"/class/{classEntity.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = true,
                    MailTitle = $"[OCM] Bạn đã bị xóa khỏi lớp {classEntity.Name}",
                    MailHtmlContent = $"<p>Bạn đã bị xóa khỏi lớp <b>{classEntity.Name}</b> bởi <b>{currentUser.DisplayName}</b>.</p><p>Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ giáo viên của lớp.</p>"
                });
            }

            // Xóa thành viên
            _repository.Remove(memberToRemove);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<ClassShopItemResponse>> GetClassShopItems(int classId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.CreatedByUser)
                .Include(c => c.ShopItemInClasses).ThenInclude(s => s.ShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isMember = classEntity.Members.Any(m => m.User != null && m.User.Id == currentUser.Id);
            if (!isOwner && !isMember)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp học này");
            }

            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);

            return await BuildClassShopItemResponses(classEntity, currentUser, currentMember);
        }

        public async Task<List<ClassMemberCosmeticResponse>> GetClassCosmetics(int classId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.CreatedByUser);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isTeacher = classEntity.Members.Any(m => m.User != null && m.User.Id == currentUser.Id && m.RoleInClass == RoleInClass.Teacher);

            if (currentMember == null && !isOwner)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp học này");
            }

            bool canViewAll = isOwner || isTeacher;
            IEnumerable<ClassMember> targetMembers = canViewAll
                ? classEntity.Members
                : currentMember != null
                    ? new List<ClassMember> { currentMember }
                    : Array.Empty<ClassMember>();

            bool hasChanges = false;
            List<ClassMemberCosmeticResponse> responses = new();

            foreach (ClassMember member in targetMembers)
            {
                Dictionary<int, UserShopItemState> stateLookup = await GetUserShopItemStateLookup(classEntity.Id, member.User.Id);
                if (EnsureCosmeticsConsistency(member, stateLookup))
                {
                    hasChanges = true;
                }

                responses.Add(MapCosmeticResponse(member, stateLookup, classEntity.Id));
            }

            if (hasChanges)
            {
                await _repository.SaveChangesAsync();
            }

            return responses
                .OrderByDescending(response => response.UpdatedAt)
                .ThenBy(response => response.UserId)
                .ToList();
        }

        public async Task<ClassMemberCosmeticResponse> EquipClassCosmetic(int classId, EquipClassCosmeticRequest request)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Members).ThenInclude(m => m.Cosmetics!).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.ShopItemInClasses).ThenInclude(s => s.ShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? member = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            if (member == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp học này");
            }

            ClassMemberCosmetic cosmetics;
            if (member.Cosmetics == null)
            {
                cosmetics = new ClassMemberCosmetic
                {
                    ClassMember = member,
                    ClassMemberId = member.Id,
                    UpdatedAt = DateTime.UtcNow
                };

                member.Cosmetics = cosmetics;
                await _repository.AddAsync(cosmetics);
            }
            else
            {
                cosmetics = member.Cosmetics;
            }

            ShopItem? shopItem = null;
            if (request.ShopItemId.HasValue)
            {
                shopItem = classEntity.ShopItemInClasses
                    .Where(relation => relation.ShopItem != null && relation.ShopItem.Id == request.ShopItemId)
                    .Select(relation => relation.ShopItem)
                    .FirstOrDefault();

                if (shopItem == null)
                {
                    throw new CustomException(ExceptionCode.NotFound, "Vật phẩm không tồn tại trong cửa hàng lớp");
                }

                CosmeticSlot itemSlot = MapVisualTypeToSlot(shopItem.VisualType);
                if (itemSlot != request.Slot)
                {
                    throw new CustomException(ExceptionCode.Invalidate, "Vật phẩm không phù hợp với slot đang chọn");
                }

                Dictionary<int, UserShopItemState> stateLookup = await GetUserShopItemStateLookup(classEntity.Id, member.User.Id);
                stateLookup.TryGetValue(shopItem.Id, out UserShopItemState? state);

                if (state == null || state.ExpiresAt <= DateTime.UtcNow)
                {
                    throw new CustomException(ExceptionCode.NotAllowUpdate, "Vật phẩm đã hết hạn hoặc chưa được mua");
                }

                cosmetics.AssignSlot(request.Slot, shopItem);
            }
            else
            {
                cosmetics.ClearSlot(request.Slot);
            }

            cosmetics.UpdatedAt = DateTime.UtcNow;
            _repository.Update(cosmetics);
            await _repository.SaveChangesAsync();

            Dictionary<int, UserShopItemState> refreshedLookup = await GetUserShopItemStateLookup(classEntity.Id, member.User.Id);
            return MapCosmeticResponse(member, refreshedLookup, classEntity.Id);
        }

        public async Task<List<ClassShopItemResponse>> AddShopItemsToClass(int classId, AddClassShopItemsRequest request)
        {
            if (request.ShopItemIds == null || request.ShopItemIds.Count == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Danh sách vật phẩm không được để trống");
            }

            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.ShopItemInClasses).ThenInclude(s => s.ShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isTeacher = classEntity.Members.Any(m => m.User != null && m.User.Id == currentUser.Id && m.RoleInClass == RoleInClass.Teacher);
            if (!isOwner && !isTeacher)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ giáo viên mới có quyền quản lý cửa hàng của lớp");
            }

            List<int> distinctIds = request.ShopItemIds.Distinct().ToList();
            HashSet<int> existingIds = classEntity.ShopItemInClasses
                .Where(s => s.ShopItem != null)
                .Select(s => s.ShopItem.Id)
                .ToHashSet();

            List<int> newIds = distinctIds.Where(id => !existingIds.Contains(id)).ToList();
            if (newIds.Count == 0)
            {
                throw new CustomException(ExceptionCode.Duplicate, "Tất cả vật phẩm đã tồn tại trong cửa hàng lớp");
            }

            Specification<ShopItem> shopItemSpec = new();
            shopItemSpec.Conditions.Add(s => newIds.Contains(s.Id));

            List<ShopItem> shopItems = await _repository.GetListAsync(shopItemSpec);
            HashSet<int> foundIds = shopItems.Select(item => item.Id).ToHashSet();
            List<int> missingIds = newIds.Where(id => !foundIds.Contains(id)).ToList();

            if (missingIds.Count > 0)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy vật phẩm với id: {string.Join(", ", missingIds)}");
            }

            Dictionary<int, ShopItem> shopItemLookup = shopItems.ToDictionary(item => item.Id);

            foreach (int itemId in newIds)
            {
                ShopItemInClass relation = new ShopItemInClass
                {
                    ShopItem = shopItemLookup[itemId]
                };

                classEntity.ShopItemInClasses.Add(relation);
            }

            _repository.Update(classEntity);
            await _repository.SaveChangesAsync();

            return await BuildClassShopItemResponses(classEntity, currentUser, null);
        }

        public async Task RemoveShopItemFromClass(int classId, int classShopItemId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.ShopItemInClasses).ThenInclude(s => s.ShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isTeacher = classEntity.Members.Any(m => m.User != null && m.User.Id == currentUser.Id && m.RoleInClass == RoleInClass.Teacher);
            if (!isOwner && !isTeacher)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ giáo viên mới có quyền quản lý cửa hàng của lớp");
            }

            ShopItemInClass? relation = classEntity.ShopItemInClasses.FirstOrDefault(s => s.Id == classShopItemId);
            if (relation == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy vật phẩm trong lớp học");
            }

            _repository.Remove(relation);
            await _repository.SaveChangesAsync();
        }

        public async Task<PurchaseShopItemResponse> PurchaseShopItem(int classId, int shopItemId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.ShopItemInClasses).ThenInclude(s => s.ShopItem);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? member = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            if (member == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp học này");
            }

            ShopItemInClass? relation = classEntity.ShopItemInClasses.FirstOrDefault(s => s.ShopItem != null && s.ShopItem.Id == shopItemId);
            if (relation?.ShopItem == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Vật phẩm không tồn tại trong cửa hàng lớp");
            }

            if (member.Points < relation.ShopItem.CostInPoints)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Điểm tích lũy không đủ để mua vật phẩm này");
            }

            member.Points -= relation.ShopItem.CostInPoints;

            UserRewardRedemption redemption = new UserRewardRedemption
            {
                User = member.User,
                Class = classEntity,
                ShopItem = relation.ShopItem,
                RedeemedAt = DateTime.UtcNow
            };

            _repository.Update(member);
            await _repository.AddAsync(redemption);
            UserShopItemState updatedState = await UpsertUserShopItemState(classEntity, member.User, relation.ShopItem, redemption);
            await _repository.SaveChangesAsync();

            // Notify purchaser (system-style notification)
            await _notificationService.CreateNotification(new CreateNotificationRequest
            {
                Type = "shop_item_purchased",
                Data = new Dictionary<string, string>
                {
                    { "className", classEntity.Name ?? string.Empty },
                    { "itemName", relation.ShopItem.Name ?? string.Empty },
                    { "costInPoints", relation.ShopItem.CostInPoints.ToString() },
                    { "remainingPoints", member.Points.ToString() }
                },
                SenderId = currentUser.Id,
                ReceiverIds = new List<int> { currentUser.Id },
                LinkRedirect = $"/class/{classEntity.Id}/store",
                OpenNewTab = false,
                NeedSendEmail = false
            });

            return new PurchaseShopItemResponse
            {
                ClassId = classId,
                ShopItemId = shopItemId,
                CostInPoints = relation.ShopItem.CostInPoints,
                RemainingPoints = member.Points,
                RedeemedAt = redemption.RedeemedAt,
                UsageDurationDays = relation.ShopItem.UsageDurationDays,
                ExpiresAt = updatedState.ExpiresAt,
                TotalPurchases = updatedState.TotalPurchases
            };
        }

        public async Task<ClassAppearanceSettingsResponse> GetClassAppearanceSettings(int classId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.AppearanceSettings);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isMember = classEntity.Members.Any(m => m.User != null && m.User.Id == currentUser.Id);
            if (!isOwner && !isMember)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp học này");
            }

            return MapAppearanceSettings(classEntity.AppearanceSettings);
        }

        public async Task<ClassAppearanceSettingsResponse> UpdateClassAppearanceSettings(int classId, UpdateClassAppearanceSettingsRequest request)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser)
                .Include(c => c.AppearanceSettings);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            bool isTeacher = currentMember?.RoleInClass == RoleInClass.Teacher;
            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isAdmin = currentUser.Role == Role.Admin;

            if (!isTeacher && !isOwner && !isAdmin)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giáo viên mới có thể chỉnh sửa cài đặt hiển thị");
            }

            ClassAppearanceSettings settings = classEntity.AppearanceSettings ?? new ClassAppearanceSettings
            {
                Class = classEntity,
                ShowAvatarFrames = true,
                ShowChatFrames = true,
                ShowBadges = true
            };

            settings.ShowAvatarFrames = request.ShowAvatarFrames;
            settings.ShowChatFrames = request.ShowChatFrames;
            settings.ShowBadges = request.ShowBadges;
            settings.UpdatedAt = DateTime.UtcNow;

            if (classEntity.AppearanceSettings == null)
            {
                await _repository.AddAsync(settings);
                classEntity.AppearanceSettings = settings;
            }
            else
            {
                _repository.Update(settings);
            }

            await _repository.SaveChangesAsync();

            return MapAppearanceSettings(settings);
        }

        public async Task<UploadClassCoverResponse> UploadClassCover(int classId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "File upload không hợp lệ");
            }

            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");
            }

            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.CreatedByUser);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            bool isTeacher = currentMember?.RoleInClass == RoleInClass.Teacher;
            bool isOwner = classEntity.CreatedByUser.Id == currentUser.Id;
            bool isAdmin = currentUser.Role == Role.Admin;

            if (!isTeacher && !isOwner && !isAdmin)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giáo viên mới có thể thay đổi ảnh bìa lớp học");
            }

            // Delete old cover image if exists
            if (!string.IsNullOrEmpty(classEntity.CoverImageUrl))
            {
                string? filePath = _storageService.ExtractFilePathFromUrl(classEntity.CoverImageUrl, Buckets.ClassCovers);
                if (!string.IsNullOrEmpty(filePath))
                {
                    try
                    {
                        await _storageService.DeleteFileAsync(filePath, Buckets.ClassCovers);
                    }
                    catch
                    {
                        // Ignore storage cleanup failure to proceed with new upload
                    }
                }
            }

            string folder = $"class-{classEntity.Id}";
            StorageUploadResponse uploadResult = await _storageService.UploadFileAsync(file, Buckets.ClassCovers, folder);

            classEntity.CoverImageUrl = uploadResult.PublicUrl ?? string.Empty;
            classEntity.CoverColor = null; // Clear color when uploading image

            _repository.Update(classEntity);
            await _repository.SaveChangesAsync();

            return new UploadClassCoverResponse
            {
                CoverImageUrl = classEntity.CoverImageUrl
            };
        }

        private async Task<List<ClassShopItemResponse>> BuildClassShopItemResponses(Class classEntity, User currentUser, ClassMember? currentMember)
        {
            IReadOnlyDictionary<int, PurchaseSummary> purchaseSummaries = await GetPurchaseSummariesForUser(classEntity.Id, currentUser.Id);
            Dictionary<int, UserShopItemState> stateLookup = await GetUserShopItemStateLookup(classEntity.Id, currentUser.Id);
            List<UserShopItemState> createdStates = new();
            ClassMemberCosmetic? currentCosmetics = currentMember?.Cosmetics;
            bool isMemberContext = currentMember != null;

            List<ClassShopItemResponse> responses = new();
            IEnumerable<ShopItemInClass> orderedRelations = classEntity.ShopItemInClasses
                .Where(relation => relation.ShopItem != null)
                .OrderBy(relation => relation.Id);

            foreach (ShopItemInClass relation in orderedRelations)
            {
                if (relation.ShopItem == null)
                {
                    continue;
                }

                purchaseSummaries.TryGetValue(relation.ShopItem.Id, out PurchaseSummary? summary);
                stateLookup.TryGetValue(relation.ShopItem.Id, out UserShopItemState? state);

                if (state == null && summary != null)
                {
                    state = await RehydrateUserShopItemState(classEntity, currentUser, relation.ShopItem);
                    if (state != null)
                    {
                        stateLookup[relation.ShopItem.Id] = state;
                        createdStates.Add(state);
                    }
                }

                responses.Add(MapToClassShopItemResponse(classEntity.Id, relation, summary, state, currentCosmetics, isMemberContext));
            }

            if (createdStates.Count > 0)
            {
                await _repository.SaveChangesAsync();
            }

            return responses;
        }

        private async Task<Dictionary<int, UserShopItemState>> GetUserShopItemStateLookup(int classId, int userId)
        {
            Specification<UserShopItemState> stateSpec = new();
            stateSpec.Conditions.Add(state => state.Class.Id == classId);
            stateSpec.Conditions.Add(state => state.User.Id == userId);
            stateSpec.Includes = query => query.Include(state => state.ShopItem);

            List<UserShopItemState> states = await _repository.GetListAsync(stateSpec);

            return states
                .Where(state => state.ShopItem != null)
                .ToDictionary(state => state.ShopItem.Id);
        }

        private async Task<UserShopItemState?> RehydrateUserShopItemState(Class classEntity, User user, ShopItem shopItem)
        {
            UserShopItemState? existing = await GetUserShopItemState(classEntity.Id, user.Id, shopItem.Id);
            if (existing != null)
            {
                return existing;
            }

            Specification<UserRewardRedemption> redemptionSpec = new();
            redemptionSpec.Conditions.Add(redemption => redemption.Class.Id == classEntity.Id);
            redemptionSpec.Conditions.Add(redemption => redemption.User.Id == user.Id);
            redemptionSpec.Conditions.Add(redemption => redemption.ShopItem.Id == shopItem.Id);
            redemptionSpec.OrderBy = query => query.OrderBy(redemption => redemption.RedeemedAt);

            List<UserRewardRedemption> history = await _repository.GetListAsync(redemptionSpec);
            if (history.Count == 0)
            {
                return null;
            }

            UserShopItemState state = BuildStateFromHistory(classEntity, user, shopItem, history);
            await _repository.AddAsync(state);
            return state;
        }

        private async Task<UserShopItemState?> GetUserShopItemState(int classId, int userId, int shopItemId)
        {
            Specification<UserShopItemState> stateSpec = new();
            stateSpec.Conditions.Add(state => state.Class.Id == classId);
            stateSpec.Conditions.Add(state => state.User.Id == userId);
            stateSpec.Conditions.Add(state => state.ShopItem.Id == shopItemId);

            return await _repository.GetAsync(stateSpec);
        }

        private async Task<UserShopItemState> UpsertUserShopItemState(Class classEntity, User user, ShopItem shopItem, UserRewardRedemption redemption)
        {
            UserShopItemState? existingState = await GetUserShopItemState(classEntity.Id, user.Id, shopItem.Id);
            int usageDuration = Math.Max(shopItem.UsageDurationDays, 1);
            DateTime newExpiration = CalculateNextExpiration(existingState?.ExpiresAt ?? DateTime.MinValue, redemption.RedeemedAt, usageDuration);

            if (existingState == null)
            {
                UserShopItemState newState = new UserShopItemState
                {
                    User = user,
                    Class = classEntity,
                    ShopItem = shopItem,
                    TotalPurchases = 1,
                    LastRedeemedAt = redemption.RedeemedAt,
                    ExpiresAt = newExpiration,
                    CreatedAt = redemption.RedeemedAt,
                    UpdatedAt = redemption.RedeemedAt
                };

                await _repository.AddAsync(newState);
                return newState;
            }

            existingState.TotalPurchases += 1;
            existingState.LastRedeemedAt = redemption.RedeemedAt;
            existingState.ExpiresAt = newExpiration;
            existingState.UpdatedAt = DateTime.UtcNow;
            _repository.Update(existingState);
            return existingState;
        }

        private static UserShopItemState BuildStateFromHistory(Class classEntity, User user, ShopItem shopItem, List<UserRewardRedemption> history)
        {
            int usageDuration = Math.Max(shopItem.UsageDurationDays, 1);
            DateTime expiresAt = DateTime.MinValue;

            foreach (UserRewardRedemption redemption in history)
            {
                expiresAt = CalculateNextExpiration(expiresAt, redemption.RedeemedAt, usageDuration);
            }

            return new UserShopItemState
            {
                User = user,
                Class = classEntity,
                ShopItem = shopItem,
                TotalPurchases = history.Count,
                LastRedeemedAt = history[^1].RedeemedAt,
                ExpiresAt = expiresAt,
                CreatedAt = history[0].RedeemedAt,
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static DateTime CalculateNextExpiration(DateTime currentExpiration, DateTime redeemedAt, int usageDurationDays)
        {
            DateTime effectiveStart = redeemedAt > currentExpiration ? redeemedAt : currentExpiration;
            return effectiveStart.AddDays(usageDurationDays);
        }

        private static int CalculateRemainingDays(DateTime? expiresAt)
        {
            if (expiresAt == null)
            {
                return 0;
            }

            double remainingDays = (expiresAt.Value - DateTime.UtcNow).TotalDays;
            if (remainingDays <= 0)
            {
                return 0;
            }

            return (int)Math.Ceiling(remainingDays);
        }

        private async Task<IReadOnlyDictionary<int, PurchaseSummary>> GetPurchaseSummariesForUser(int classId, int userId)
        {
            Specification<UserRewardRedemption> redemptionSpec = new();
            redemptionSpec.Conditions.Add(redemption => redemption.Class.Id == classId);
            redemptionSpec.Conditions.Add(redemption => redemption.User.Id == userId);
            redemptionSpec.Includes = query => query.Include(redemption => redemption.ShopItem);

            List<UserRewardRedemption> redemptions = await _repository.GetListAsync(redemptionSpec);

            return redemptions
                .Where(redemption => redemption.ShopItem != null)
                .GroupBy(redemption => redemption.ShopItem.Id)
                .ToDictionary(
                    group => group.Key,
                    group => new PurchaseSummary(
                        group.Count(),
                        group.Max(redemption => redemption.RedeemedAt)
                    )
                );
        }

        private static ClassShopItemResponse MapToClassShopItemResponse(int classId, ShopItemInClass relation, PurchaseSummary? summary, UserShopItemState? state, ClassMemberCosmetic? currentCosmetics, bool isMemberContext)
        {
            if (relation.ShopItem == null)
            {
                throw new InvalidOperationException("Shop item relation is missing ShopItem data.");
            }

            string? equippedSlot = null;
            if (currentCosmetics != null)
            {
                if (currentCosmetics.AvatarFrameShopItemId == relation.ShopItem.Id)
                {
                    equippedSlot = CosmeticSlot.AvatarFrame.ToString();
                }
                else if (currentCosmetics.ChatFrameShopItemId == relation.ShopItem.Id)
                {
                    equippedSlot = CosmeticSlot.ChatFrame.ToString();
                }
                else if (currentCosmetics.BadgeShopItemId == relation.ShopItem.Id)
                {
                    equippedSlot = CosmeticSlot.Badge.ToString();
                }
            }

            bool isEquipped = !string.IsNullOrEmpty(equippedSlot);
            bool canEquip = isMemberContext && state != null && state.ExpiresAt > DateTime.UtcNow;

            return new ClassShopItemResponse
            {
                Id = relation.Id,
                ClassId = classId,
                ShopItemId = relation.ShopItem.Id,
                Name = relation.ShopItem.Name,
                Description = relation.ShopItem.Description,
                CostInPoints = relation.ShopItem.CostInPoints,
                IconUrl = relation.ShopItem.IconUrl ?? string.Empty,
                VisualType = relation.ShopItem.VisualType,
                Tier = relation.ShopItem.Tier,
                IsDefault = relation.ShopItem.IsDefault,
                IsPurchasedByCurrentUser = (state?.TotalPurchases ?? summary?.Count ?? 0) > 0,
                PurchaseCountByCurrentUser = state?.TotalPurchases ?? summary?.Count ?? 0,
                LastPurchasedAt = state?.LastRedeemedAt ?? summary?.LastRedeemedAt,
                UsageDurationDays = relation.ShopItem.UsageDurationDays,
                ExpiresAt = state?.ExpiresAt,
                RemainingDays = CalculateRemainingDays(state?.ExpiresAt),
                EquippedInSlot = equippedSlot,
                IsEquippedByCurrentUser = isEquipped,
                CanEquip = canEquip
            };
        }

        private async Task AssignDefaultShopItemsToClass(Class classEntity)
        {
            Specification<ShopItem> defaultItemsSpec = new();
            defaultItemsSpec.Conditions.Add(item => item.IsDefault);

            List<ShopItem> defaultItems = await _repository.GetListAsync(defaultItemsSpec);
            if (defaultItems.Count == 0)
            {
                return;
            }

            classEntity.ShopItemInClasses ??= new List<ShopItemInClass>();

            HashSet<int> existingItemIds = classEntity.ShopItemInClasses
                .Where(relation => relation.ShopItem != null)
                .Select(relation => relation.ShopItem.Id)
                .ToHashSet();

            bool hasChanges = false;
            foreach (ShopItem defaultItem in defaultItems)
            {
                if (existingItemIds.Contains(defaultItem.Id))
                {
                    continue;
                }

                ShopItemInClass relation = new ShopItemInClass
                {
                    ShopItem = defaultItem
                };

                classEntity.ShopItemInClasses.Add(relation);
                hasChanges = true;
            }

            if (hasChanges)
            {
                _repository.Update(classEntity);
                await _repository.SaveChangesAsync();
            }
        }

        private ClassAppearanceSettingsResponse MapAppearanceSettings(ClassAppearanceSettings? appearanceSettings)
        {
            if (appearanceSettings == null)
            {
                return new ClassAppearanceSettingsResponse
                {
                    ShowAvatarFrames = true,
                    ShowChatFrames = true,
                    ShowBadges = true,
                    UpdatedAt = DateTime.UtcNow
                };
            }

            return _mapper.Map<ClassAppearanceSettingsResponse>(appearanceSettings);
        }

        private bool EnsureCosmeticsConsistency(ClassMember member, Dictionary<int, UserShopItemState> stateLookup)
        {
            if (member.Cosmetics == null)
            {
                return false;
            }

            bool updated = false;
            updated |= TryClearSlotIfExpired(member.Cosmetics, CosmeticSlot.AvatarFrame, member.Cosmetics.AvatarFrameShopItemId, stateLookup);
            updated |= TryClearSlotIfExpired(member.Cosmetics, CosmeticSlot.ChatFrame, member.Cosmetics.ChatFrameShopItemId, stateLookup);
            updated |= TryClearSlotIfExpired(member.Cosmetics, CosmeticSlot.Badge, member.Cosmetics.BadgeShopItemId, stateLookup);

            if (updated)
            {
                member.Cosmetics.UpdatedAt = DateTime.UtcNow;
                _repository.Update(member.Cosmetics);
            }

            return updated;
        }

        private static bool TryClearSlotIfExpired(ClassMemberCosmetic cosmetics, CosmeticSlot slot, int? shopItemId, Dictionary<int, UserShopItemState> stateLookup)
        {
            if (shopItemId == null)
            {
                return false;
            }

            if (!stateLookup.TryGetValue(shopItemId.Value, out UserShopItemState? state) || state.ExpiresAt <= DateTime.UtcNow)
            {
                cosmetics.ClearSlot(slot);
                return true;
            }

            return false;
        }

        private ClassMemberCosmeticResponse MapCosmeticResponse(ClassMember member, Dictionary<int, UserShopItemState> stateLookup, int classId)
        {
            ClassMemberCosmetic? cosmetics = member.Cosmetics;
            return new ClassMemberCosmeticResponse
            {
                ClassMemberId = member.Id,
                UserId = member.User.Id,
                ClassId = classId,
                AvatarFrame = BuildEquippedItemResponse(cosmetics?.AvatarFrameShopItem, TryGetState(stateLookup, cosmetics?.AvatarFrameShopItemId)),
                ChatFrame = BuildEquippedItemResponse(cosmetics?.ChatFrameShopItem, TryGetState(stateLookup, cosmetics?.ChatFrameShopItemId)),
                Badge = BuildEquippedItemResponse(cosmetics?.BadgeShopItem, TryGetState(stateLookup, cosmetics?.BadgeShopItemId)),
                UpdatedAt = cosmetics?.UpdatedAt ?? member.EnrollDate
            };
        }

        private static EquippedCosmeticItemResponse? BuildEquippedItemResponse(ShopItem? shopItem, UserShopItemState? state)
        {
            if (shopItem == null)
            {
                return null;
            }

            return new EquippedCosmeticItemResponse
            {
                ShopItemId = shopItem.Id,
                Name = shopItem.Name,
                IconUrl = shopItem.IconUrl ?? string.Empty,
                VisualType = shopItem.VisualType,
                Tier = shopItem.Tier,
                ExpiresAt = state?.ExpiresAt,
                RemainingDays = CalculateRemainingDays(state?.ExpiresAt),
                Config = CosmeticConfigParser.Parse(shopItem.ConfigJson)
            };
        }

        private static UserShopItemState? TryGetState(Dictionary<int, UserShopItemState> stateLookup, int? shopItemId)
        {
            if (shopItemId == null)
            {
                return null;
            }

            stateLookup.TryGetValue(shopItemId.Value, out UserShopItemState? state);
            return state;
        }

        private static CosmeticSlot MapVisualTypeToSlot(ShopItemVisualType visualType)
        {
            return visualType switch
            {
                ShopItemVisualType.AvatarFrame => CosmeticSlot.AvatarFrame,
                ShopItemVisualType.ChatFrame => CosmeticSlot.ChatFrame,
                _ => CosmeticSlot.Badge
            };
        }

        private sealed class PurchaseSummary
        {
            public PurchaseSummary(int count, DateTime lastRedeemedAt)
            {
                Count = count;
                LastRedeemedAt = lastRedeemedAt;
            }

            public int Count { get; }

            public DateTime LastRedeemedAt { get; }
        }

        private string GenerateJoinCode()
        {
            // Generate a random 6-character code
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            Random random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        public async Task InviteToClass(int classId, InviteToClassRequest request)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng hiện tại");

            // Lấy thông tin lớp học
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = ep => ep
                .Include(c => c.Members).ThenInclude(m => m.User);
            Class classEntity = await _repository.GetAsync(classSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");

            // Kiểm tra người dùng hiện tại có phải là thành viên của lớp không
            ClassMember? currentMember = classEntity.Members.FirstOrDefault(m => m.User != null && m.User.Id == currentUser.Id);
            if (currentMember == null)
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp này");

            // Tìm người dùng được mời theo email
            User? invitedUser = await _repository.GetAsync<User>(u => u.Email.ToLower() == request.Email.ToLower());
            if (invitedUser == null)
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy người dùng với email này");

            // Kiểm tra người được mời đã là thành viên chưa
            if (classEntity.Members.Any(m => m.User != null && m.User.Id == invitedUser.Id))
                throw new CustomException(ExceptionCode.BadRequest, "Người dùng này đã là thành viên của lớp");

            // Gửi thông báo mời vào lớp
            CreateNotificationRequest notiRequest = new CreateNotificationRequest
            {
                Type = "class_invitation",
                Data = new Dictionary<string, string>
                {
                    { "inviterName", currentUser.DisplayName },
                    { "className", classEntity.Name },
                    { "joinCode", classEntity.JoinCode }
                },
                SenderId = currentUser.Id,
                ReceiverIds = new List<int> { invitedUser.Id },
                LinkRedirect = $"/class/{classId}",
                OpenNewTab = false,
                NeedSendEmail = true,
                MailTitle = $"[OCM] Lời mời tham gia lớp {classEntity.Name}",
                MailHtmlContent = $"<p><b>{currentUser.DisplayName}</b> đã mời bạn tham gia lớp <b>{classEntity.Name}</b>.</p><p>Mã lớp: <b>{classEntity.JoinCode}</b></p><p>Vui lòng đăng nhập và sử dụng mã này để tham gia lớp.</p>"
            };
            await _notificationService.CreateNotification(notiRequest);
        }
    }
}