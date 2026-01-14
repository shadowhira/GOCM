using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.Grades
{
    public class GetPaginatedAssignmentGradeRequest : BasePaginatedRequest
    {
        public string? SearchTerm { get; set; }
    }
    
}