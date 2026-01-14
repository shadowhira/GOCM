using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Documents
{
    public class UploadDocumentRequest
    {
        public IFormFile File { get; set; } = null!;
        public int ClassId { get; set; } 
        public ParentType ParentType { get; set; }
    }
}
