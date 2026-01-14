using System;
using System.Collections.Generic;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Classes
{
    public class ClassMemberCosmeticResponse
    {
        public int ClassMemberId { get; set; }
        public int UserId { get; set; }
        public int ClassId { get; set; }
        public EquippedCosmeticItemResponse? AvatarFrame { get; set; }
        public EquippedCosmeticItemResponse? ChatFrame { get; set; }
        public EquippedCosmeticItemResponse? Badge { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class EquippedCosmeticItemResponse
    {
        public int ShopItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string IconUrl { get; set; } = string.Empty;
        public ShopItemVisualType VisualType { get; set; }
        public ShopItemTier Tier { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public int RemainingDays { get; set; }
        public Dictionary<string, string>? Config { get; set; }
    }
}
