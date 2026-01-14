using OnlineClassroomManagement.Helper.BaseModel;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Posts
{
    public class GetPaginatedPostsRequest : BasePaginatedRequest
    {
        public PostStatus? Status { get; set; }
        public int? CreatedById { get; set; }
        public int? ClassId { get; set; }
    }
}
