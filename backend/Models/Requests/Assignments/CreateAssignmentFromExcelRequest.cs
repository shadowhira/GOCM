namespace OnlineClassroomManagement.Models.Requests.Assignments
{
    public class CreateAssignmentFromExcelRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public DateTime Deadline { get; set; }
        public List<CreateAttachmentRequest>? Attachments { get; set; }
        public IFormFile ExcelFile { get; set; }
    }
}