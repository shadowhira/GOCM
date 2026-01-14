namespace OnlineClassroomManagement.Models.Requests.Users
{
    public class ChangePasswordRequest
    {
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
