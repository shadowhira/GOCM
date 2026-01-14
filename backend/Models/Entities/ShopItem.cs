using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class ShopItem
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CostInPoints { get; set; }
        public string IconUrl { get; set; }
        public string ConfigJson { get; set; } = "{}";
        public int UsageDurationDays { get; set; } = 30;
        public ShopItemVisualType VisualType { get; set; } = ShopItemVisualType.NameBadge;
        public ShopItemTier Tier { get; set; } = ShopItemTier.Basic;
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
