using System.ComponentModel.DataAnnotations;
namespace OnlineClassroomManagement.Models.Requests.Comments
{
    public class CreateCommentRequest
    {
        public int PostId { get; set; }
        [Required(ErrorMessage = "Nội dung bình luận không được để trống")]
        [StringLength(5000, ErrorMessage = "Nội dung bình luận không được vượt quá 5000 ký tự")]
        public string Content { get; set; } = string.Empty;
        public int? ParentCommentId { get; set; }
        public int CreatedByClassMemberId { get; set; }
        public int? DocumentId { get; set; }
    }
}
