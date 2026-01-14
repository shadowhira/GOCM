using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class EquipClassCosmeticRequest
    {
        public CosmeticSlot Slot { get; set; }
        public int? ShopItemId { get; set; }
    }
}
