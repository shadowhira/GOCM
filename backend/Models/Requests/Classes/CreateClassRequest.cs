namespace OnlineClassroomManagement.Models.Requests.Classes
{
    public class CreateClassRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}