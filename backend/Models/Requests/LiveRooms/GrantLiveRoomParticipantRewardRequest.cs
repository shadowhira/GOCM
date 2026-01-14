using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class GrantLiveRoomParticipantRewardRequest
    {
        [Required]
        [MaxLength(64)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(512)]
        public string? Note { get; set; }
    }
}
