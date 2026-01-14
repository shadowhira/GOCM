using System.ComponentModel.DataAnnotations;
namespace OnlineClassroomManagement.Models.Requests.Comments
{
    public class UpdateCommentRequest
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Nội dung bình luận không được để trống")]
        [StringLength(5000, ErrorMessage = "Nội dung bình luận không được vượt quá 5000 ký tự")]
        public string Content { get; set; } = string.Empty;
        // DocumentId mong muốn sau khi cập nhật (null: không thay đổi, 0: xóa document)
        public int? DocumentId { get; set; }
    }
}
