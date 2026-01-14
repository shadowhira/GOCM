using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.Rewards
{
    public class GrantRewardRequest
    {
        [Range(1, 1000, ErrorMessage = "Số điểm phải nằm trong khoảng 1-1000")]
        public int Points { get; set; }

        [MaxLength(512)]
        public string? Reason { get; set; }
    }
}
