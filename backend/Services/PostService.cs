using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Posts;
using OnlineClassroomManagement.Models.Responses.Posts;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IPostService
    {
        public Task<List<PostResponse>> GetAllPosts();
        public Task<PaginatedList<PostResponse>> GetListPosts(GetPaginatedPostsRequest request);
        public Task<PostResponse> GetPostById(int id);
        public Task CreatePost(CreatePostRequest request);
        public Task UpdatePost(UpdatePostRequest request);
        public Task DeletePost(int id);
    }

    public class PostService : IPostService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public PostService(IRepository repository, IMapper mapper, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task<List<PostResponse>> GetAllPosts()
        {
            Specification<Post> spec = new();
            spec.Includes = ep => ep
                .Include(p => p.CreatedBy).ThenInclude(m => m.User)
                .Include(p => p.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(p => p.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(p => p.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(p => p.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.User)
                .Include(p => p.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(p => p.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(p => p.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            
            List<Post> posts = await _repository.GetListAsync(spec);
            return _mapper.Map<List<PostResponse>>(posts);
        }

        public async Task<PaginatedList<PostResponse>> GetListPosts(GetPaginatedPostsRequest request)
        {
            // Xây dựng IQueryable<Post> duy nhất, không sửa entity: dùng join bảng trung gian PostInClass khi có ClassId.
            IQueryable<Post> query = _repository.GetQueryable<Post>();

            // Join qua PostInClass nếu cần lọc theo lớp
            if (request.ClassId.HasValue)
            {
                int classId = request.ClassId.Value;
                query = from p in query
                        join pic in _repository.GetQueryable<PostInClass>() on p.Id equals pic.Post.Id
                        where pic.Class.Id == classId
                        select p;
            }

            // Lọc theo từ khóa (dùng EF.Functions.Like để tránh ToLower trên toàn bộ cột nếu DB collation insensitive)
            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                string keyword = request.Keyword.Trim().ToLower();
                string pattern = $"%{keyword}%";
                query = query.Where(p =>
                    (p.Title != null && EF.Functions.Like(p.Title.ToLower(), pattern)) ||
                    (p.Content != null && EF.Functions.Like(p.Content.ToLower(), pattern))
                );
            }

            // Include các navigation cần cho response
            query = query
                .Include(post => post.CreatedBy).ThenInclude(member => member.User)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.User)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(post => post.Comments).ThenInclude(comment => comment.CreatedBy).ThenInclude(member => member.User)
                .Include(post => post.Comments).ThenInclude(comment => comment.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(post => post.Comments).ThenInclude(comment => comment.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(post => post.Comments).ThenInclude(comment => comment.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            // Tổng số trước phân trang
            int totalItems = await query.CountAsync();

            // Sắp xếp + phân trang trên DB
            List<Post> pageData = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<PostResponse> items = _mapper.Map<List<PostResponse>>(pageData);
            return new PaginatedList<PostResponse>(items, totalItems, request.PageNumber, request.PageSize);
        }

        public async Task CreatePost(CreatePostRequest request)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa được xác thực");

            Post post = _mapper.Map<Post>(request);
            post.CreatedAt = DateTime.UtcNow;

            // Kiểm tra ClassMember tồn tại
            ClassMember classMember = await _repository.GetByIdAsync<ClassMember>(request.CreatedByClassMemberId)
                ?? throw new CustomException(ExceptionCode.NotFound, "ClassMember không tồn tại");
            post.CreatedBy = classMember;

            // Kiểm tra danh sách lớp học
            if (request.ClassIds == null || !request.ClassIds.Any())
            {
                throw new CustomException(ExceptionCode.NotFound, "ClassIds không được để trống");
            }

            // Liên kết tài liệu đã upload (qua Document API)
            if (request.DocumentIds != null && request.DocumentIds.Any())
            {
                List<Document> documents = await _repository.GetListAsync<Document>(
                    doc => request.DocumentIds.Contains(doc.Id));

                if (documents.Count != request.DocumentIds.Count)
                {
                    throw new CustomException(ExceptionCode.NotFound, "Một hoặc nhiều DocumentIds không tồn tại");
                }

                post.Documents = documents;
            }

            // Validate: phải có ít nhất 1 trong 3 trường (title, content, documents) có dữ liệu
            bool isTitleEmpty = string.IsNullOrWhiteSpace(post.Title);
            bool isContentEmpty = string.IsNullOrWhiteSpace(post.Content);
            bool isDocumentsEmpty = post.Documents == null || !post.Documents.Any();
            if (isTitleEmpty && isContentEmpty && isDocumentsEmpty)
            {
                throw new CustomException(ExceptionCode.BadRequest);
            }

            _repository.Add(post);

            // Tạo liên kết bài đăng với các lớp
            List<Class> classes = await _repository.GetListAsync<Class>(
                cls => request.ClassIds.Contains(cls.Id));

            foreach (Class cls in classes)
            {
                _repository.Add(new PostInClass
                {
                    Post = post,
                    Class = cls
                });
            }
            
            await _repository.SaveChangesAsync();

            // Notify class members about new post (per class context)
            foreach (Class cls in classes)
            {
                Specification<Class> classSpec = new();
                classSpec.Conditions.Add(c => c.Id == cls.Id);
                classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

                Class? classEntity = await _repository.GetAsync(classSpec);
                if (classEntity?.Members == null)
                {
                    continue;
                }

                List<int> receiverIds = classEntity.Members
                    .Where(m => m.User != null && m.User.Id != currentUser.Id)
                    .Select(m => m.User!.Id)
                    .Distinct()
                    .ToList();

                if (receiverIds.Count == 0)
                {
                    continue;
                }

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "post_created",
                    Data = new Dictionary<string, string>
                    {
                        { "userName", currentUser.DisplayName ?? string.Empty },
                        { "postTitle", post.Title ?? string.Empty },
                        { "className", classEntity.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = receiverIds,
                    LinkRedirect = $"/class/{classEntity.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task DeletePost(int id)
        {
            Specification<Post> spec = new();
            spec.Conditions.Add(post => post.Id == id);

            Post post = await _repository.GetAsync(spec) 
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bài viết");

            _repository.Remove(post);
            await _repository.SaveChangesAsync();
        }

        public async Task<PostResponse> GetPostById(int id)
        {
            Specification<Post> spec = new();
            spec.Conditions.Add(post => post.Id == id);
            spec.Includes = query => query
                .Include(post => post.CreatedBy).ThenInclude(member => member.User)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(post => post.CreatedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.User)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(post => post.Documents).ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Post? post = await _repository.GetAsync(spec) 
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bài viết");

            return _mapper.Map<PostResponse>(post);
        }

        public async Task UpdatePost(UpdatePostRequest request)
        {
            Specification<Post> spec = new();
            spec.Conditions.Add(post => post.Id == request.Id);
            spec.Includes = query => query.Include(post => post.Documents);

            Post post = await _repository.GetAsync(spec) 
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bài viết");

            // Cập nhật thông tin cơ bản
            _mapper.Map(request, post);
            post.UpdatedAt = DateTime.UtcNow;

            // Đồng bộ tài liệu nếu có thay đổi
            if (request.DocumentIds != null)
            {
                HashSet<int> currentDocIds = post.Documents.Select(doc => doc.Id).ToHashSet();
                HashSet<int> requestedDocIds = request.DocumentIds.ToHashSet();

                // Xóa tài liệu không còn trong danh sách mới
                List<Document> toRemove = post.Documents
                    .Where(doc => !requestedDocIds.Contains(doc.Id))
                    .ToList();
                
                foreach (Document doc in toRemove)
                {
                    post.Documents.Remove(doc);
                }

                // Thêm tài liệu mới
                List<int> toAddIds = requestedDocIds.Except(currentDocIds).ToList();
                if (toAddIds.Any())
                {
                    List<Document> toAddDocs = await _repository.GetListAsync<Document>(
                        doc => toAddIds.Contains(doc.Id));
                    
                    if (toAddDocs.Count != toAddIds.Count)
                    {
                        throw new CustomException(ExceptionCode.NotFound, "Một hoặc nhiều DocumentIds không tồn tại");
                    }
                    
                    foreach (Document doc in toAddDocs)
                    {
                        post.Documents.Add(doc);
                    }
                }
            }

            _repository.Update(post);
            await _repository.SaveChangesAsync();
        }
    }
}
