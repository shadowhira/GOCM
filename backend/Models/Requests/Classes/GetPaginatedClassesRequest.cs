using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class GetPaginatedClassesRequest : BasePaginatedRequest
    {
        public string? Name { get; set; } // Để tìm kiếm theo tên lớp
        public bool? OnlyMine { get; set; } // Chỉ lấy các lớp của user hiện tại
    }
}