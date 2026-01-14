using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.Documents
{
    public class GetPaginatedDocumentsRequest : BasePaginatedRequest
    {
        public int ClassId { get; set; } // Id của Class chứa document
    }
}
