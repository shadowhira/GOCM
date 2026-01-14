namespace OnlineClassroomManagement.Models.Entities
{
    public class Class
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string JoinCode { get; set; }
        public User CreatedByUser { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Cover customization
        public string? CoverImageUrl { get; set; }  // URL ảnh bìa (nếu có)
        public string? CoverColor { get; set; }     // Mã màu nền (nếu không dùng ảnh), ví dụ: "#4F46E5"

        public List<ClassMember> Members { get; set; } = new List<ClassMember>();
        public List<Document> Documents { get; set; } = new List<Document>();
        public List<ShopItemInClass> ShopItemInClasses { get; set; } = new List<ShopItemInClass>();
        public ClassAppearanceSettings? AppearanceSettings { get; set; }
    }
}
