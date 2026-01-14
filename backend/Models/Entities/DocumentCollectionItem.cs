using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class DocumentCollectionItem : Document
    {
        public string? ManualDocumentUrl { get; set; }
        public string? ManualFileName { get; set; }
        public DateTime AddedAt { get; set; }
        public SourceType SourceType { get; set; }
    }
}
