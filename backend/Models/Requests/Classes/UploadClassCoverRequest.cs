using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class UploadClassCoverRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
