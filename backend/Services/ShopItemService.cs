using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.ShopItems;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IShopItemService
    {
        Task<List<ShopItem>> GetAllShopItems();
        Task<PaginatedList<ShopItem>> GetListShopItems(GetPaginatedShopItemsRequest request);
        Task<ShopItem> GetShopItemById(int id);
        Task<ShopItem> CreateShopItem(ShopItem shopItem);
        Task<ShopItem> UpdateShopItem(int id, ShopItem shopItem);
        Task DeleteShopItem(int id);
        Task<string> UploadShopItemIcon(IFormFile file);
    }

    public class ShopItemService : IShopItemService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IStorageService _storageService;

        public ShopItemService(
            IRepository repository,
            ICurrentUserService currentUserService,
            IStorageService storageService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _storageService = storageService;
        }

        public async Task<List<ShopItem>> GetAllShopItems()
        {
            // Admin-only access
            await ValidateAdminAccess();

            Specification<ShopItem> spec = new();
            List<ShopItem> shopItems = await _repository.GetListAsync(spec);
            return shopItems;
        }

        public async Task<PaginatedList<ShopItem>> GetListShopItems(GetPaginatedShopItemsRequest request)
        {
            // Admin-only access
            await ValidateAdminAccess();

            PaginationSpecification<ShopItem> paginationSpec = new()
            {
                PageIndex = request.PageNumber,
                PageSize = request.PageSize
            };

            // Search by keyword in Name or Description
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                paginationSpec.Conditions.Add(e =>
                    e.Name.ToLower().Contains(request.Keyword.ToLower()) ||
                    e.Description.ToLower().Contains(request.Keyword.ToLower())
                );
            }

            PaginatedList<ShopItem> shopItems = await _repository.GetListAsync(paginationSpec);
            return shopItems;
        }

        public async Task<ShopItem> GetShopItemById(int id)
        {
            // Admin-only access
            await ValidateAdminAccess();

            ShopItem? shopItem = await _repository.GetAsync<ShopItem>(e => e.Id == id);

            if (shopItem == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy shop item với id {id}");
            }

            return shopItem;
        }

        public async Task<ShopItem> CreateShopItem(ShopItem shopItem)
        {
            // Admin-only access
            await ValidateAdminAccess();

            // Validate input
            if (string.IsNullOrWhiteSpace(shopItem.Name))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Tên shop item không được để trống");
            }

            if (shopItem.CostInPoints < 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Giá không được âm");
            }

            if (shopItem.UsageDurationDays <= 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Số ngày sử dụng phải lớn hơn 0");
            }

            // Check duplicate name
            bool nameExists = await _repository.ExistsAsync<ShopItem>(e => e.Name == shopItem.Name);
            if (nameExists)
            {
                throw new CustomException(ExceptionCode.Duplicate, "Tên shop item đã tồn tại");
            }

            // Ensure Id is 0 for new entity
            shopItem.Id = 0;

            // Set default icon if not provided
            if (string.IsNullOrWhiteSpace(shopItem.IconUrl))
            {
                shopItem.IconUrl = "";
            }

            if (string.IsNullOrWhiteSpace(shopItem.Description))
            {
                shopItem.Description = string.Empty;
            }

            // Set timestamps
            shopItem.CreatedAt = DateTime.UtcNow;
            shopItem.UpdatedAt = null;
            shopItem.ConfigJson = NormalizeConfigJson(shopItem.ConfigJson);

            await _repository.AddAsync(shopItem);
            await _repository.SaveChangesAsync();

            await EnsureDefaultItemAssignedToAllClasses(shopItem);

            return shopItem;
        }

        public async Task<ShopItem> UpdateShopItem(int id, ShopItem shopItem)
        {
            // Admin-only access
            await ValidateAdminAccess();

            // Check if shop item exists
            ShopItem? existingItem = await _repository.GetAsync<ShopItem>(e => e.Id == id);
            if (existingItem == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy shop item với id {id}");
            }

            // Validate input
            if (string.IsNullOrWhiteSpace(shopItem.Name))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Tên shop item không được để trống");
            }

            if (shopItem.CostInPoints < 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Giá không được âm");
            }

            if (shopItem.UsageDurationDays <= 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Số ngày sử dụng phải lớn hơn 0");
            }

            // Check duplicate name (if name changed)
            if (existingItem.Name != shopItem.Name)
            {
                bool nameExists = await _repository.ExistsAsync<ShopItem>(e => e.Name == shopItem.Name && e.Id != id);
                if (nameExists)
                {
                    throw new CustomException(ExceptionCode.Duplicate, "Tên shop item đã tồn tại");
                }
            }

            // Update properties
            existingItem.Name = shopItem.Name;
            existingItem.Description = shopItem.Description ?? "";
            existingItem.CostInPoints = shopItem.CostInPoints;
            existingItem.UsageDurationDays = shopItem.UsageDurationDays;
            existingItem.VisualType = shopItem.VisualType;
            existingItem.Tier = shopItem.Tier;
            existingItem.IsDefault = shopItem.IsDefault;
            existingItem.ConfigJson = NormalizeConfigJson(shopItem.ConfigJson);

            // Only update IconUrl if provided
            if (!string.IsNullOrWhiteSpace(shopItem.IconUrl))
            {
                existingItem.IconUrl = shopItem.IconUrl;
            }

            // Update timestamp
            existingItem.UpdatedAt = DateTime.UtcNow;

            _repository.Update(existingItem);
            await _repository.SaveChangesAsync();

            await EnsureDefaultItemAssignedToAllClasses(existingItem);

            return existingItem;
        }

        public async Task DeleteShopItem(int id)
        {
            // Admin-only access
            await ValidateAdminAccess();

            // Check if shop item exists
            ShopItem? shopItem = await _repository.GetAsync<ShopItem>(e => e.Id == id);
            if (shopItem == null)
            {
                throw new CustomException(ExceptionCode.NotFound, $"Không tìm thấy shop item với id {id}");
            }

            // Xóa icon trên storage nếu có
            if (!string.IsNullOrEmpty(shopItem.IconUrl))
            {
                string? filePath = _storageService.ExtractFilePathFromUrl(shopItem.IconUrl, Buckets.ShopItems);
                if (!string.IsNullOrEmpty(filePath))
                {
                    try
                    {
                        await _storageService.DeleteFileAsync(filePath, Buckets.ShopItems);
                    }
                    catch
                    {
                        // Log lỗi nếu cần, nhưng vẫn tiếp tục xóa shop item
                    }
                }
            }

            // Clear cosmetic references (ClassMemberCosmetics has DeleteBehavior.Restrict)
            await DetachCosmeticAssignments(shopItem.Id);

            _repository.Remove(shopItem);
            await _repository.SaveChangesAsync();
        }

        public async Task<string> UploadShopItemIcon(IFormFile file)
        {
            // Admin-only access
            await ValidateAdminAccess();

            if (file == null || file.Length == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "File không hợp lệ");
            }

            // Validate file type (images only)
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)");
            }

            // Upload to shopitems bucket (dedicated bucket for shop item icons)
            var uploadResponse = await _storageService.UploadFileAsync(file, Buckets.ShopItems, "");

            return uploadResponse?.PublicUrl ?? throw new CustomException(ExceptionCode.UnKnow, "Upload file thất bại");
        }

        private async Task EnsureDefaultItemAssignedToAllClasses(ShopItem shopItem)
        {
            if (!shopItem.IsDefault)
            {
                return;
            }

            Specification<Class> classSpec = new();
            classSpec.Includes = query => query
                .Include(c => c.ShopItemInClasses).ThenInclude(relation => relation.ShopItem);

            List<Class> classes = await _repository.GetListAsync(classSpec);
            if (classes.Count == 0)
            {
                return;
            }

            bool hasChanges = false;
            foreach (Class classEntity in classes)
            {
                classEntity.ShopItemInClasses ??= new List<ShopItemInClass>();

                bool alreadyAssigned = classEntity.ShopItemInClasses
                    .Any(relation => relation.ShopItem != null && relation.ShopItem.Id == shopItem.Id);

                if (alreadyAssigned)
                {
                    continue;
                }

                classEntity.ShopItemInClasses.Add(new ShopItemInClass
                {
                    ShopItem = shopItem
                });

                _repository.Update(classEntity);
                hasChanges = true;
            }

            if (hasChanges)
            {
                await _repository.SaveChangesAsync();
            }
        }

        private async Task DetachCosmeticAssignments(int shopItemId)
        {
            Specification<ClassMemberCosmetic> cosmeticSpec = new();
            cosmeticSpec.Conditions.Add(cosmetic =>
                cosmetic.AvatarFrameShopItemId == shopItemId ||
                cosmetic.ChatFrameShopItemId == shopItemId ||
                cosmetic.BadgeShopItemId == shopItemId);

            List<ClassMemberCosmetic> affectedCosmetics = await _repository.GetListAsync(cosmeticSpec);
            if (affectedCosmetics.Count == 0)
            {
                return;
            }

            foreach (ClassMemberCosmetic cosmetic in affectedCosmetics)
            {
                bool updated = false;

                if (cosmetic.AvatarFrameShopItemId == shopItemId)
                {
                    cosmetic.AvatarFrameShopItemId = null;
                    cosmetic.AvatarFrameShopItem = null;
                    updated = true;
                }

                if (cosmetic.ChatFrameShopItemId == shopItemId)
                {
                    cosmetic.ChatFrameShopItemId = null;
                    cosmetic.ChatFrameShopItem = null;
                    updated = true;
                }

                if (cosmetic.BadgeShopItemId == shopItemId)
                {
                    cosmetic.BadgeShopItemId = null;
                    cosmetic.BadgeShopItem = null;
                    updated = true;
                }

                if (updated)
                {
                    cosmetic.UpdatedAt = DateTime.UtcNow;
                    _repository.Update(cosmetic);
                }
            }
        }

        private static string NormalizeConfigJson(string? rawConfig)
        {
            if (string.IsNullOrWhiteSpace(rawConfig))
            {
                return "{}";
            }

            return rawConfig.Trim();
        }

        private async Task ValidateAdminAccess()
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Không tìm thấy thông tin người dùng");
            }

            if (currentUser.Role != Role.Admin)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Chỉ admin mới có quyền thực hiện thao tác này");
            }
        }
    }
}
