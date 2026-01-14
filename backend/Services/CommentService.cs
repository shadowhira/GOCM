using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Comments;
using OnlineClassroomManagement.Models.Responses.Comments;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface ICommentService
    {
        Task<PaginatedList<CommentResponse>> GetListComments(GetPaginatedCommentsRequest request);
        Task<CommentResponse> GetCommentById(int id);
        Task CreateComment(CreateCommentRequest request);
        Task UpdateComment(UpdateCommentRequest request);
        Task DeleteComment(int id);
    }

    public class CommentService : ICommentService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public CommentService(IRepository repository, IMapper mapper, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task<PaginatedList<CommentResponse>> GetListComments(GetPaginatedCommentsRequest request)
        {
            // Lấy danh sách comment theo PostId + ParentCommentId
            IQueryable<Comment> query = _repository.GetQueryable<Comment>()
                .Where(c => EF.Property<int>(c, "PostId") == request.PostId);

            if (request.ParentCommentId.HasValue)
            {
                int parentId = request.ParentCommentId.Value;
                query = query.Where(c => c.ParentCommentId == parentId);
            }
            else
            {
                query = query.Where(c => c.ParentCommentId == null);
            }

            query = query
                .Include(c => c.CreatedBy).ThenInclude(m => m.User)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.ParentComment)
                .Include(c => c.Document!);

            // Lọc theo từ khóa (nếu có)
            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                string keyword = request.Keyword.Trim().ToLower();
                query = query.Where(c => c.Content != null && c.Content.ToLower().Contains(keyword));
            }

            int total = await query.CountAsync();

            List<Comment> items = await query
                .OrderBy(c => c.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<CommentResponse> responses = _mapper.Map<List<CommentResponse>>(items);

            await PopulateReplyMetadata(responses);

            return new PaginatedList<CommentResponse>(responses, total, request.PageNumber, request.PageSize);
        }
        
        public async Task<CommentResponse> GetCommentById(int id)
        {
            Specification<Comment> spec = new();
            spec.Conditions.Add(c => c.Id == id);
            spec.Includes = q => q
                .Include(c => c.CreatedBy).ThenInclude(m => m.User)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.ParentComment)
                .Include(c => c.Document!);

            Comment comment = await _repository.GetAsync(spec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bình luận");

            return _mapper.Map<CommentResponse>(comment);
        }

        public async Task CreateComment(CreateCommentRequest request)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Không xác định được người dùng");

            // Kiểm tra Post tồn tại và lấy kèm Comments collection để thêm comment vào
            Specification<Post> postSpec = new();
            postSpec.Conditions.Add(p => p.Id == request.PostId);
            postSpec.Includes = q => q
                .Include(p => p.CreatedBy)
                    .ThenInclude(m => m.User);
            
            Post post = await _repository.GetAsync(postSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Bài đăng không tồn tại");

            ClassMember classMember = await _repository.GetByIdAsync<ClassMember>(request.CreatedByClassMemberId)
                ?? throw new CustomException(ExceptionCode.NotFound, "Thành viên lớp không tồn tại");

            Comment? parentComment = null;
            if (request.ParentCommentId is int parentId)
            {
                Specification<Comment> parentSpec = new();
                parentSpec.Conditions.Add(c => c.Id == parentId);
                parentSpec.Conditions.Add(c => EF.Property<int>(c, "PostId") == request.PostId);
                parentSpec.Includes = q => q
                    .Include(c => c.CreatedBy)
                        .ThenInclude(m => m.User);
                parentComment = await _repository.GetAsync(parentSpec)
                    ?? throw new CustomException(ExceptionCode.NotFound, "Bình luận cha không hợp lệ hoặc không thuộc cùng bài đăng");
            }

            Comment comment = new()
            {
                Content = request.Content,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = classMember,
                ParentComment = parentComment,
                ParentCommentId = request.ParentCommentId
            };

            // Đính kèm Document nếu có
            if (request.DocumentId.HasValue && request.DocumentId.Value > 0)
            {
                Document document = await _repository.GetByIdAsync<Document>(request.DocumentId.Value)
                    ?? throw new CustomException(ExceptionCode.NotFound, "Document không tồn tại");
                comment.Document = document;
            }

            // Gắn comment với Post để EF thiết lập PostId (FK) đúng và tránh lỗi FK_Comments_Posts_PostId
            post.Comments.Add(comment);
            _repository.Update(post);
            await _repository.SaveChangesAsync();

            // Resolve class context for link (Post can belong to multiple classes; pick the first)
            PostInClass? postInClass = await _repository.GetAsync<PostInClass>(
                pic => pic.Post.Id == request.PostId,
                includes: q => q.Include(pic => pic.Class));

            int? classId = postInClass?.Class?.Id;
            string className = postInClass?.Class?.Name ?? string.Empty;
            string authorName = classMember.User?.DisplayName ?? currentUser.DisplayName ?? string.Empty;
            string postTitle = post.Title ?? string.Empty;

            // Notify owner (no self-notification)
            if (parentComment?.CreatedBy?.User != null)
            {
                int receiverId = parentComment.CreatedBy.User.Id;
                if (receiverId != currentUser.Id)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "comment_replied",
                        Data = new Dictionary<string, string>
                        {
                            { "userName", authorName },
                            { "postTitle", postTitle },
                            { "className", className }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = new List<int> { receiverId },
                        LinkRedirect = classId.HasValue ? $"/class/{classId.Value}" : null,
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }
            else if (post.CreatedBy?.User != null)
            {
                int receiverId = post.CreatedBy.User.Id;
                if (receiverId != currentUser.Id)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "comment_created_on_post",
                        Data = new Dictionary<string, string>
                        {
                            { "userName", authorName },
                            { "postTitle", postTitle },
                            { "className", className }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = new List<int> { receiverId },
                        LinkRedirect = classId.HasValue ? $"/class/{classId.Value}" : null,
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }
        }

        private async Task PopulateReplyMetadata(List<CommentResponse> parentComments)
        {
            if (parentComments.Count == 0)
            {
                return;
            }

            List<int> parentIds = parentComments.Select(c => c.Id).ToList();

            List<(int ParentId, int Count)> replyCounts = await _repository.GetQueryable<Comment>()
                .Where(c => c.ParentCommentId != null
                            && parentIds.Contains(c.ParentCommentId!.Value))
                .GroupBy(c => c.ParentCommentId)
                .Select(group => new ValueTuple<int, int>(group.Key!.Value, group.Count()))
                .ToListAsync();

            Dictionary<int, int> replyCountMap = replyCounts.ToDictionary(x => x.ParentId, x => x.Count);

            List<Comment> previewEntities = await _repository.GetQueryable<Comment>()
                .Where(c => c.ParentCommentId != null
                            && parentIds.Contains(c.ParentCommentId!.Value))
                .Include(c => c.CreatedBy).ThenInclude(m => m.User)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.Document)
                .ToListAsync();

            Dictionary<int, List<CommentReplyPreviewResponse>> previewMap = new();
            foreach (Comment preview in previewEntities)
            {
                int parentId = preview.ParentCommentId!.Value;
                if (!previewMap.TryGetValue(parentId, out List<CommentReplyPreviewResponse>? list))
                {
                    list = new List<CommentReplyPreviewResponse>();
                    previewMap[parentId] = list;
                }

                list.Add(_mapper.Map<CommentReplyPreviewResponse>(preview));
            }

            foreach (List<CommentReplyPreviewResponse> previews in previewMap.Values)
            {
                previews.Sort((a, b) => b.CreatedAt.CompareTo(a.CreatedAt));
                if (previews.Count > ReplyPreviewLimit)
                {
                    previews.RemoveRange(ReplyPreviewLimit, previews.Count - ReplyPreviewLimit);
                }
            }

            foreach (CommentResponse comment in parentComments)
            {
                if (replyCountMap.TryGetValue(comment.Id, out int count))
                {
                    comment.ReplyCount = count;
                }

                if (previewMap.TryGetValue(comment.Id, out List<CommentReplyPreviewResponse>? previews))
                {
                    comment.LatestReplies = previews;
                }
            }
        }

        private const int ReplyPreviewLimit = 2;

        public async Task UpdateComment(UpdateCommentRequest request)
        {
            Specification<Comment> spec = new();
            spec.Conditions.Add(c => c.Id == request.Id);
            spec.Includes = q => q
                .Include(c => c.CreatedBy).ThenInclude(m => m.User)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem)
                .Include(c => c.Document);

            Comment comment = await _repository.GetAsync(spec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bình luận");

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Không xác định được người dùng");

            if (comment.CreatedBy.User.Id != currentUser.Id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ người tạo mới được sửa bình luận");
            }

            // Cập nhật nội dung
            comment.Content = request.Content;
            comment.UpdatedAt = DateTime.UtcNow;

            // Xử lý Document theo semantics:
            // - null: giữ nguyên
            // - 0: xóa document hiện tại
            // - >0: thay bằng document mới
            if (request.DocumentId.HasValue)
            {
                if (request.DocumentId.Value == 0)
                {
                    // DocumentId = 0: xóa document hiện tại
                    comment.Document = null;
                }
                else
                {
                    // Thay đổi document
                    Document document = await _repository.GetByIdAsync<Document>(request.DocumentId.Value)
                        ?? throw new CustomException(ExceptionCode.NotFound, "Document không tồn tại");
                    comment.Document = document;
                }
            }
            // Nếu DocumentId = null: không thay đổi document
            
            _repository.Update(comment);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteComment(int id)
        {
            Specification<Comment> spec = new();
            spec.Conditions.Add(c => c.Id == id);
            spec.Includes = q => q
                .Include(c => c.CreatedBy).ThenInclude(m => m.User)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.CreatedBy).ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Comment comment = await _repository.GetAsync(spec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bình luận");

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Không xác định được người dùng");

            bool isOwner = comment.CreatedBy.User.Id == currentUser.Id;

            // Lấy PostId của comment
            int postId = await _repository.GetQueryable<Comment>()
                .Where(c => c.Id == comment.Id)
                .Select(c => EF.Property<int>(c, "PostId"))
                .FirstAsync();

            // Lấy danh sách ClassId mà Post này thuộc về (Post có thể thuộc nhiều lớp)
            List<int> classIds = await _repository.GetQueryable<PostInClass>()
                .Where(pic => EF.Property<int>(pic, "PostId") == postId)
                .Select(pic => EF.Property<int>(pic, "ClassId"))
                .ToListAsync();

            // Kiểm tra currentUser là giáo viên ở bất kỳ lớp nào chứa Post
            bool isCurrentUserTeacher = await _repository.GetQueryable<ClassMember>()
                .Where(cm => EF.Property<int>(cm, "UserId") == currentUser.Id
                             && cm.RoleInClass == RoleInClass.Teacher
                             && classIds.Contains(EF.Property<int>(cm, "ClassId")))
                .AnyAsync();

            if (!isOwner && !isCurrentUserTeacher)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Không có quyền xóa bình luận này");
            }

            _repository.Remove(comment);
            await _repository.SaveChangesAsync();
        }
    }
}
