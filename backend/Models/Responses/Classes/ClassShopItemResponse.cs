using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Classes
{
    public class ClassShopItemResponse
    {
        public int Id { get; set; }
        public int ClassId { get; set; }
        public int ShopItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CostInPoints { get; set; }
        public string IconUrl { get; set; } = string.Empty;
        public ShopItemVisualType VisualType { get; set; }
        public ShopItemTier Tier { get; set; }
        public bool IsDefault { get; set; }
        public bool IsPurchasedByCurrentUser { get; set; }
        public int PurchaseCountByCurrentUser { get; set; }
        public DateTime? LastPurchasedAt { get; set; }
        public int UsageDurationDays { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int RemainingDays { get; set; }
        public string? EquippedInSlot { get; set; }
        public bool IsEquippedByCurrentUser { get; set; }
        public bool CanEquip { get; set; }
    }
}
