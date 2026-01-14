using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Documents;
using OnlineClassroomManagement.Models.Responses.Documents;
using OnlineClassroomManagement.Models.Responses.Storage;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Services
{
    public interface IDocumentService
    {
        public Task<List<DocumentResponse>> GetAllDocuments();
        public Task<PaginatedList<DocumentResponse>> GetListDocuments(GetPaginatedDocumentsRequest request);
        public Task<DocumentResponse> GetDocumentById(int id);
        public Task<List<DocumentResponse>> GetDocumentsByClassId(int classId);
        public Task<DocumentResponse> UploadDocument(UploadDocumentRequest request);
        public Task DeleteDocument(int id);
    }

    public class DocumentService : IDocumentService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IStorageService _storageService;
        private readonly ICurrentUserService _currentUserService;
        private readonly INotificationService _notificationService;

        public DocumentService(IRepository repository, IMapper mapper, IStorageService storageService, ICurrentUserService currentUserService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _storageService = storageService;
            _currentUserService = currentUserService;
            _notificationService = notificationService;
        }

        public async Task<List<DocumentResponse>> GetAllDocuments()
        {
            Specification<Document> spec = new();
            spec.Includes = query => query
                .Include(document => document.UploadedBy).ThenInclude(member => member.User)
                .Include(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            List<Document> documents = await _repository.GetListAsync(spec);
            return _mapper.Map<List<DocumentResponse>>(documents);
        }

        public async Task<PaginatedList<DocumentResponse>> GetListDocuments(GetPaginatedDocumentsRequest request)
        {
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == request.ClassId);
            classSpec.Includes = query => query
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy).ThenInclude(member => member.User)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            Class classEntity = await _repository.GetAsync(classSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Class không tồn tại");

            int totalItems = classEntity.Documents?.Count ?? 0;
            List<Document> paginatedDocuments = (classEntity.Documents ?? new List<Document>())
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            List<DocumentResponse> responses = _mapper.Map<List<DocumentResponse>>(paginatedDocuments);
            return new PaginatedList<DocumentResponse>(responses, totalItems, request.PageNumber, request.PageSize);
        }

        public async Task<DocumentResponse> GetDocumentById(int id)
        {
            Specification<Document> documentSpec = new();
            documentSpec.Conditions.Add(d => d.Id == id);
            documentSpec.Includes = query => query
                .Include(d => d.UploadedBy).ThenInclude(member => member.User)
                .Include(d => d.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(d => d.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(d => d.UploadedBy).ThenInclude(member => member.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Document document = await _repository.GetAsync(documentSpec) 
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy document");

            return _mapper.Map<DocumentResponse>(document);
        }

        public async Task<List<DocumentResponse>> GetDocumentsByClassId(int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa đăng nhập");

            // Query qua Class entity để lấy Documents và Members
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = query => query
                .Include(c => c.Members).ThenInclude(m => m.User)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy!)
                        .ThenInclude(member => member.User)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy!)
                        .ThenInclude(member => member.Cosmetics!)
                            .ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy!)
                        .ThenInclude(member => member.Cosmetics!)
                            .ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(c => c.Documents)
                    .ThenInclude(document => document.UploadedBy!)
                        .ThenInclude(member => member.Cosmetics!)
                            .ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            
            Class classEntity = await _repository.GetAsync(classSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Class không tồn tại");

            ClassMember? currentMember = classEntity.Members?.FirstOrDefault(m => m.User?.Id == currentUser.Id)
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp này");

            if (classEntity.Documents == null || classEntity.Documents.Count == 0)
                return new List<DocumentResponse>();

            bool isTeacher = currentMember.RoleInClass == RoleInClass.Teacher;

            // Giảng viên xem tất cả, sinh viên chỉ xem submission của mình
            List<Document> filteredDocuments = isTeacher
                ? classEntity.Documents.ToList()
                : classEntity.Documents
                    .Where(d => d.ParentType != ParentType.Submission || d.UploadedBy?.User?.Id == currentUser.Id)
                    .ToList();

            return _mapper.Map<List<DocumentResponse>>(filteredDocuments);
        }

        public async Task<DocumentResponse> UploadDocument(UploadDocumentRequest request)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa đăng nhập");

            Specification<Class> spec = new();
            spec.Conditions.Add(c => c.Id == request.ClassId);
            spec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class classEntity = await _repository.GetAsync(spec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Class không tồn tại");

            ClassMember classMember = classEntity.Members?.FirstOrDefault(m => m.User?.Id == currentUser.Id)
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp này");

            string folder = $"class-{request.ClassId}/{request.ParentType}";
            StorageUploadResponse uploadResult = await _storageService.UploadFileAsync(request.File, Buckets.Documents, folder);

            DateTime now = DateTime.UtcNow;
            Document document = new()
            {
                PublicUrl = uploadResult.PublicUrl ?? string.Empty,
                FilePath = uploadResult.FilePath ?? string.Empty,
                FileName = request.File.FileName,
                FileType = GetFileTypeFromExtension(request.File.FileName),
                UploadedBy = classMember,
                CreatedAt = now,
                UpdatedAt = now,
                ParentType = request.ParentType
            };

            classEntity.Documents ??= new List<Document>();
            classEntity.Documents.Add(document);
            _repository.Update(classEntity);
            await _repository.SaveChangesAsync();

            // Notify class members when a document is uploaded (skip submission uploads)
            if (request.ParentType != ParentType.Submission)
            {
                List<int> receiverIds = classEntity.Members
                    .Where(m => m.User != null && m.User.Id != currentUser.Id)
                    .Select(m => m.User!.Id)
                    .Distinct()
                    .ToList();

                if (receiverIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "document_uploaded",
                        Data = new Dictionary<string, string>
                        {
                            { "userName", currentUser.DisplayName ?? string.Empty },
                            { "fileName", request.File.FileName },
                            { "className", classEntity.Name ?? string.Empty },
                            { "parentType", request.ParentType.ToString() }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = receiverIds,
                        LinkRedirect = $"/class/{classEntity.Id}/documents",
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }

            return _mapper.Map<DocumentResponse>(document);
        }

        public async Task DeleteDocument(int id)
        {
            // Lấy user hiện tại, kiểm tra quyền xóa
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Người dùng chưa đăng nhập");

            Specification<Document> spec = new();
            spec.Conditions.Add(d => d.Id == id);
            spec.Includes = q => q
                .Include(d => d.UploadedBy).ThenInclude(m => m.User)
                .Include(d => d.UploadedBy).ThenInclude(m => m.Class).ThenInclude(c => c.Members).ThenInclude(m => m.User);

            Document document = await _repository.GetAsync(spec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy document");

            Class classEntity = document.UploadedBy?.Class
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin lớp của document");

            ClassMember currentMember = classEntity.Members?.FirstOrDefault(m => m.User?.Id == currentUser.Id)
                ?? throw new CustomException(ExceptionCode.Unauthorized, "Bạn không phải thành viên của lớp này");

            bool isTeacher = currentMember.RoleInClass == RoleInClass.Teacher;
            bool isOwner = document.UploadedBy.User?.Id == currentUser.Id;

            // Chỉ cho phép xóa nếu là giảng viên hoặc là người upload
            if (!isTeacher && !isOwner)
                throw new CustomException(ExceptionCode.Unauthorized, "Bạn không có quyền xóa document này");

            if (!string.IsNullOrEmpty(document.FilePath))
            {
                try
                {
                    await _storageService.DeleteFileAsync(document.FilePath, Buckets.Documents);
                }
                catch
                {
                    throw new CustomException(ExceptionCode.NotAllowUpdate, "Xóa file khỏi storage thất bại");
                }
            }

            _repository.Remove(document);
            await _repository.SaveChangesAsync();
        }

        // Xác định loại file từ extension
        private static FileType GetFileTypeFromExtension(string fileName)
        {
            string extension = Path.GetExtension(fileName)?.ToLower() ?? string.Empty;
            return extension switch
            {
                ".pdf" => FileType.Pdf,
                ".doc" or ".docx" => FileType.Word,
                ".xls" or ".xlsx" => FileType.Excel,
                ".ppt" or ".pptx" => FileType.PowerPoint,
                ".jpg" or ".jpeg" or ".png" or ".gif" => FileType.Image,
                ".mp4" or ".mov" or ".avi" => FileType.Video,
                ".mp3" or ".wav" => FileType.Audio,
                ".txt" or ".csv" => FileType.Text,
                ".zip" or ".rar" or ".7z" => FileType.Zip,
                _ => FileType.Other
            };
        }
    }
}
