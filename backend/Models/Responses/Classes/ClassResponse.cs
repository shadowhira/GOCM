using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Responses.Classes
{
    public class ClassResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string JoinCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public string CreatedByUserName { get; set; } = string.Empty;
        public string? CreatedByUserAvatarUrl { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public RoleInClass? UserRoleInClass { get; set; } // Vai trò của user hiện tại trong lớp (nếu có)
        public ClassAppearanceSettingsResponse AppearanceSettings { get; set; } = new();
        
        // Cover customization
        public string? CoverImageUrl { get; set; }  // URL ảnh bìa (nếu có)
        public string? CoverColor { get; set; }     // Mã màu nền (nếu không dùng ảnh)
        
        // Fields for dashboard
        public int PendingAssignmentsCount { get; set; }  // Số bài tập chưa nộp, còn hạn (cho student)
        public DateTime? NextDeadline { get; set; }  // Deadline gần nhất (cho student)
    }
}