using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Posts
{
    public class UpdatePostRequest
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        // Danh sách DocumentIds mong muốn sau khi cập nhật (nếu null: không thay đổi documents)
        public List<int>? DocumentIds { get; set; }
        public PostStatus? Status { get; set; }
    }
}
