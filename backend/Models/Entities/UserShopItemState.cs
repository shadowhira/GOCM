namespace OnlineClassroomManagement.Models.Entities
{
    public class UserShopItemState
    {
        public int Id { get; set; }
        public User User { get; set; }
        public Class Class { get; set; }
        public ShopItem ShopItem { get; set; }
        public int TotalPurchases { get; set; }
        public DateTime LastRedeemedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
