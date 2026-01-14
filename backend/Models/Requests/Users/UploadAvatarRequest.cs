using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.Users
{
    public class UploadAvatarRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
