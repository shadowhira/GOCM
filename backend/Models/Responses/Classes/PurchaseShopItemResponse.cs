namespace OnlineClassroomManagement.Models.Responses.Classes
{
    public class PurchaseShopItemResponse
    {
        public int ClassId { get; set; }
        public int ShopItemId { get; set; }
        public int CostInPoints { get; set; }
        public int RemainingPoints { get; set; }
        public DateTime RedeemedAt { get; set; }
        public int UsageDurationDays { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int TotalPurchases { get; set; }
    }
}
