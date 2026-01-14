using OnlineClassroomManagement.Helper.BaseModel;
using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Assignments
{
    public class GetPaginatedAssignmentsRequest : BasePaginatedRequest
    {
        public string Title { get; set; } = string.Empty;
        public AssignmentType? Type { get; set; }
        public AssignmentType? ExcludeType { get; set; }
    }
}