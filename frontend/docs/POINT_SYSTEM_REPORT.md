# Báo Cáo Hệ Thống Điểm & Cấu Hình Shop Item

## Tổng Quan

Tài liệu này cung cấp phân tích và hướng dẫn cấu hình toàn diện cho hệ thống điểm thưởng trong ứng dụng Quản Lý Lớp Học Trực Tuyến.

---

## 1. Các Hành Động Nhận/Phạt Điểm

### 1.1 Thưởng Tự Động (Hệ thống tự động cấp)

| Hành động | Điểm | Điều kiện |
|-----------|------|-----------|
| Tham gia Live Room | **20** | Lần đầu tham gia phòng học trực tiếp |
| Bonus tham gia sớm | **10** | Tham gia trong 5 phút đầu khi phòng mở |
| Nộp bài đúng hạn | **25** | Nộp bài tập trước deadline |
| Bonus điểm cao | **30** | Đạt điểm ≥90% trong bài được chấm |

### 1.2 Thưởng Do Giáo Viên Cấp

| Hành động | Mặc định | Phạm vi | Mô tả |
|-----------|----------|---------|-------|
| Đóng góp bài viết | **15** | 5-50 | Thưởng cho bài post chất lượng |
| Đóng góp bình luận | **10** | 5-30 | Thưởng cho comment hữu ích |
| Thưởng thủ công | - | 5-100 | Công nhận chung |

### 1.3 Phạt Điểm

| Hành động | Mặc định | Tối đa/ngày | Mô tả |
|-----------|----------|-------------|-------|
| Phạt thủ công | **-10** | -100 | Trừ điểm vì vi phạm |

---

## 2. Giới Hạn Theo Ngày

| Loại giới hạn | Giá trị | Lý do |
|---------------|---------|-------|
| Thưởng thủ công tối đa/ngày | **200** | Ngăn lạm phát điểm |
| Phạt tối đa/ngày | **100** | Bảo vệ học sinh khỏi bị phạt quá mức |

---

## 3. Phân Tích Tiềm Năng Kiếm Điểm

### 3.1 Kịch Bản Kiếm Điểm Hàng Ngày

| Mức độ tích cực | Điểm ước tính | Hoạt động |
|-----------------|---------------|-----------|
| **Thụ động** | 20-30 | Chỉ tham gia live room |
| **Tích cực** | 50-100 | Tham gia + nộp bài + comment |
| **Rất tích cực** | 100-200 | Tất cả + được giáo viên thưởng |

### 3.2 Ước Tính Theo Tuần/Tháng

| Thời gian | Tối thiểu | Trung bình | Tối đa |
|-----------|-----------|------------|--------|
| Tuần (5 ngày) | 150 | 400 | 1000 |
| Tháng (4 tuần) | 600 | 1600 | 4000 |

---

## 4. Hướng Dẫn Giá Shop Item

### 4.1 Bảng Giá Theo Tier

| Tier | Phạm vi giá | Khuyến nghị | Thời hạn | Nỗ lực cần |
|------|-------------|-------------|----------|------------|
| **Basic** | 100-200 | 150 | 7 ngày | 2-5 ngày tích cực |
| **Advanced** | 300-500 | 400 | 14 ngày | 1-2 tuần |
| **Elite** | 600-1000 | 800 | 30 ngày | 2-3 tuần |
| **Legendary** | 1500-3000 | 2000 | 60 ngày | 1-2 tháng |

### 4.2 Khuyến Nghị Thời Hạn Sử Dụng

| Tier | Thời hạn | Lý do |
|------|----------|-------|
| Basic | 7 ngày | Cam kết thấp, khuyến khích mua lại |
| Advanced | 14 ngày | Giá trị vừa, kéo dài 2 tuần học |
| Elite | 30 ngày | Giá trị cao, hiển thị cả tháng |
| Legendary | 60 ngày | Trạng thái premium, đầu tư đáng kể |

### 4.3 Triết Lý Định Giá

1. **Dễ tiếp cận**: Item Basic có thể đạt trong vài ngày tham gia tích cực
2. **Tiến triển rõ ràng**: Mỗi tier cảm thấy như một nâng cấp có ý nghĩa
3. **Thời hạn tỷ lệ thuận**: Item giá cao hơn sử dụng lâu hơn
4. **Cân bằng**: Ngăn tích trữ điểm bằng cách có item hấp dẫn ở mỗi tier

---

## 5. Cấu Hình Tập Trung

### 5.1 Cấu Hình Backend

**File**: `backend/Helper/Constants/RewardPointRules.cs`

```csharp
public static class RewardPointRules
{
    // Giới hạn theo ngày
    public const int MaxManualRewardPerDay = 200;
    public const int MaxPenaltyPerDay = 100;

    // Điểm hoạt động
    public static class Activities
    {
        public const int LiveRoomJoin = 20;
        public const int LiveRoomQuickBonus = 10;
        public const int OnTimeSubmission = 25;
        public const int HighGradeBonus = 30;
        public const int PostContribution = 15;
        public const int CommentContribution = 10;
        public const int ManualPenalty = -10;
    }

    // Phạm vi thưởng
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

    // Ngưỡng
    public static class Thresholds
    {
        public const int HighGradeScore = 90;
    }

    // Giá Shop Item
    public static class ShopItemPricing
    {
        // Basic: 100-200 điểm, 7 ngày
        // Advanced: 300-500 điểm, 14 ngày
        // Elite: 600-1000 điểm, 30 ngày
        // Legendary: 1500-3000 điểm, 60 ngày
    }
}
```

### 5.2 Cấu Hình Frontend

**File**: `frontend/src/config/pointSystem.ts`

File này mirror cấu hình backend để sử dụng cho:
- Validation và gợi ý trên UI
- Giá trị mặc định trong form
- Tài liệu hướng dẫn người dùng
- Các helper function tính toán tier

---

## 6. Hướng Dẫn Điều Chỉnh

### 6.1 Khi Nào Tăng Giá Trị Điểm

- Mức độ tương tác của học sinh thấp
- Shop item cảm thấy quá đắt
- Thời gian mua item đầu tiên quá lâu (>1 tuần cho Basic)

### 6.2 Khi Nào Giảm Giá Trị Điểm

- Quan sát thấy lạm phát điểm
- Học sinh tích lũy quá nhiều điểm
- Shop item được mua quá nhanh

### 6.3 Kiểm Tra Thay Đổi

1. Điều chỉnh giá trị trong `RewardPointRules.cs`
2. Cập nhật `frontend/src/config/pointSystem.ts` cho khớp
3. Theo dõi 1-2 tuần
4. Thu thập phản hồi và điều chỉnh

---

## 7. Cân Nhắc Tương Lai

### 7.1 Bổ Sung Tiềm Năng

- **Bonus chuỗi**: Điểm thêm cho tham gia liên tục nhiều ngày
- **Mục tiêu tuần**: Bonus khi đạt mục tiêu hoạt động tuần
- **Thưởng giới thiệu**: Điểm khi mời bạn cùng lớp
- **Mở khóa thành tích**: Bonus một lần cho các mốc quan trọng

### 7.2 Chỉ Số Sức Khỏe Kinh Tế

Theo dõi các chỉ số này để đảm bảo kinh tế lành mạnh:

| Chỉ số | Phạm vi khỏe mạnh | Hành động nếu ngoài phạm vi |
|--------|-------------------|------------------------------|
| Điểm kiếm TB/ngày | 50-100 | Điều chỉnh điểm hoạt động |
| Ngày đến lần mua đầu | 3-7 | Điều chỉnh giá Basic tier |
| Tốc độ tích lũy điểm | Ổn định | Kiểm tra exploit |
| Đa dạng mua item | 70%+ được mua | Điều chỉnh cân bằng tier |

---

## 8. Tóm Tắt

Hệ thống điểm được thiết kế để:

1. ✅ Thưởng cho tham gia tích cực
2. ✅ Cung cấp tiến triển có ý nghĩa
3. ✅ Duy trì cân bằng kinh tế
4. ✅ Dễ dàng điều chỉnh từ cấu hình tập trung

**File chính cần sửa**:
- Backend: `backend/Helper/Constants/RewardPointRules.cs`
- Frontend: `frontend/src/config/pointSystem.ts`

---

*Cập nhật lần cuối: 5 tháng 12, 2025*
