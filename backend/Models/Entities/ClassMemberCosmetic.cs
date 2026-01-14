using System;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class ClassMemberCosmetic
    {
        public int ClassMemberId { get; set; }
        public ClassMember ClassMember { get; set; } = null!;

        public int? AvatarFrameShopItemId { get; set; }
        public ShopItem? AvatarFrameShopItem { get; set; }

        public int? ChatFrameShopItemId { get; set; }
        public ShopItem? ChatFrameShopItem { get; set; }

        public int? BadgeShopItemId { get; set; }
        public ShopItem? BadgeShopItem { get; set; }

        public DateTime UpdatedAt { get; set; }

        public void ClearSlot(CosmeticSlot slot)
        {
            switch (slot)
            {
                case CosmeticSlot.AvatarFrame:
                    AvatarFrameShopItemId = null;
                    AvatarFrameShopItem = null;
                    break;
                case CosmeticSlot.ChatFrame:
                    ChatFrameShopItemId = null;
                    ChatFrameShopItem = null;
                    break;
                case CosmeticSlot.Badge:
                    BadgeShopItemId = null;
                    BadgeShopItem = null;
                    break;
            }
        }

        public void AssignSlot(CosmeticSlot slot, ShopItem shopItem)
        {
            switch (slot)
            {
                case CosmeticSlot.AvatarFrame:
                    AvatarFrameShopItem = shopItem;
                    AvatarFrameShopItemId = shopItem.Id;
                    break;
                case CosmeticSlot.ChatFrame:
                    ChatFrameShopItem = shopItem;
                    ChatFrameShopItemId = shopItem.Id;
                    break;
                case CosmeticSlot.Badge:
                    BadgeShopItem = shopItem;
                    BadgeShopItemId = shopItem.Id;
                    break;
            }
        }
    }
}
