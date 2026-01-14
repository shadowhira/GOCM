using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.ShopItems
{
    public class UploadShopItemIconRequest
    {
        [Required]
        public IFormFile File { get; set; } = null!;
    }
}
