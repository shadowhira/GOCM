using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Posts
{
    public class CreatePostRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        // Danh sách Document đã được upload qua Document API
        public List<int>? DocumentIds { get; set; }
        public List<int> ClassIds { get; set; } = new();
        public PostStatus? Status { get; set; }
        public int CreatedByClassMemberId { get; set; } // Id của ClassMember tạo bài viết
    }
}
