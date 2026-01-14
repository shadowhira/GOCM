using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Requests.Assignments
{
    public class UpdateAttachmentRequest
    {
        public int Id { get; set; } // 0 = new attachment, >0 = update existing attachment
        public string Url { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public FileType FileType { get; set; }
    }
}