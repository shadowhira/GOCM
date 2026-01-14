using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.Comments
{
    public class GetPaginatedCommentsRequest : BasePaginatedRequest
    {
        public int PostId { get; set; } 
        public int? ParentCommentId { get; set; }
    }
}
