namespace OnlineClassroomManagement.Models.Entities
{
    public class UserRewardRedemption
    {
        public int Id { get; set; }
        public User User { get; set; }
        public Class Class { get; set; }
        public ShopItem ShopItem { get; set; }
        public DateTime RedeemedAt { get; set; }
    }
}
