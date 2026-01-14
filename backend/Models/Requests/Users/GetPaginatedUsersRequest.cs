using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.Users
{
    public class GetPaginatedUsersRequest : BasePaginatedRequest
    {
        // Thêm các thuộc tính lọc khác nếu cần

        // Ví dụ: lọc theo tên người dùng
        public string DisplayName { get; set; } = string.Empty;
    }
}
