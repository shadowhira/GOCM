namespace OnlineClassroomManagement.Helper.Constants;

/// <summary>
/// Cấu hình tập trung cho hệ thống điểm thưởng/phạt.
/// Điều chỉnh các giá trị ở đây mà không cần sửa business logic.
/// 
/// === THIẾT KẾ KINH TẾ ĐIỂM ===
/// 
/// Ước tính điểm kiếm được mỗi ngày (học sinh tích cực):
/// - Tham gia live room: 20 điểm (1 lần/phòng)
/// - Bonus tham gia sớm: 10 điểm (trong 5 phút đầu)
/// - Đóng góp bài post: 15 điểm (giáo viên tùy chỉnh 5-50)
/// - Đóng góp comment: 10 điểm (giáo viên tùy chỉnh 5-30)
/// - Nộp bài đúng hạn: 25 điểm
/// - Bonus điểm cao: 30 điểm (≥90%)
/// 
/// Ước tính tối đa mỗi ngày: ~80-200 điểm
/// Ước tính mỗi tuần: ~400-1000 điểm
/// Ước tính mỗi tháng: ~1600-4000 điểm
/// 
/// Hướng dẫn giá Shop Item:
/// - Basic: 100-200 điểm (2-5 ngày tích cực)
/// - Advanced: 300-500 điểm (1-2 tuần)
/// - Elite: 600-1000 điểm (2-3 tuần)
/// - Legendary: 1500-3000 điểm (1-2 tháng)
/// </summary>
public static class RewardPointRules
{
    #region Giới hạn theo ngày
    /// <summary>Điểm tối đa giáo viên có thể thưởng thủ công cho 1 học sinh/ngày</summary>
    public const int MaxManualRewardPerDay = 200;
    
    /// <summary>Điểm phạt tối đa cho 1 học sinh/ngày</summary>
    public const int MaxPenaltyPerDay = 100;
    #endregion

    #region Điểm hoạt động
    public static class Activities
    {
        // === Thưởng tự động ===
        /// <summary>Điểm tham gia live room (1 lần/phòng)</summary>
        public const int LiveRoomJoin = 20;
        
        /// <summary>Bonus tham gia sớm (trong 5 phút đầu)</summary>
        public const int LiveRoomQuickBonus = 10;
        
        /// <summary>Điểm nộp bài đúng hạn</summary>
        public const int OnTimeSubmission = 25;
        
        /// <summary>Bonus đạt điểm cao (≥90%)</summary>
        public const int HighGradeBonus = 30;

        // === Thưởng do giáo viên (giá trị mặc định) ===
        /// <summary>Điểm mặc định cho đóng góp bài post</summary>
        public const int PostContribution = 15;
        
        /// <summary>Điểm mặc định cho đóng góp comment</summary>
        public const int CommentContribution = 10;

        // === Phạt ===
        /// <summary>Điểm phạt mặc định</summary>
        public const int ManualPenalty = -10;
    }
    #endregion

    #region Phạm vi điểm thưởng (cho giáo viên thưởng thủ công)
    public static class Ranges
    {
        public const int PostRewardMin = 5;
        public const int PostRewardMax = 50;
        
        public const int CommentRewardMin = 5;
        public const int CommentRewardMax = 30;
        
        public const int ManualRewardMin = 5;
        public const int ManualRewardMax = 100;
        
        public const int PenaltyMin = 5;
        public const int PenaltyMax = 50;
    }
    #endregion

    #region Ngưỡng
    public static class Thresholds
    {
        /// <summary>Điểm tối thiểu (0-100) để nhận bonus điểm cao</summary>
        public const int HighGradeScore = 90;
    }
    #endregion

    #region Hướng dẫn giá Shop Item
    /// <summary>
    /// Phạm vi giá khuyến nghị theo tier (theo điểm).
    /// Duration tỷ lệ với giá - giá cao = thời hạn dài hơn.
    /// </summary>
    public static class ShopItemPricing
    {
        // Basic: Dễ đạt, thời hạn ngắn
        public const int BasicMinPrice = 100;
        public const int BasicMaxPrice = 200;
        public const int BasicDurationDays = 7;
        
        // Advanced: Nỗ lực vừa phải, thời hạn trung bình
        public const int AdvancedMinPrice = 300;
        public const int AdvancedMaxPrice = 500;
        public const int AdvancedDurationDays = 14;
        
        // Elite: Nỗ lực đáng kể, thời hạn dài
        public const int EliteMinPrice = 600;
        public const int EliteMaxPrice = 1000;
        public const int EliteDurationDays = 30;
        
        // Legendary: Thành tích lớn, thời hạn kéo dài
        public const int LegendaryMinPrice = 1500;
        public const int LegendaryMaxPrice = 3000;
        public const int LegendaryDurationDays = 60;
    }
    #endregion
    
    // Legacy property for backward compatibility
    public const int InitialLiveRoomJoinPoints = Activities.LiveRoomJoin;
}
