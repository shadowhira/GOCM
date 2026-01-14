namespace OnlineClassroomManagement.Models.Responses.Admin
{
    public class AdminOverviewResponse
    {
        // Existing stats
        public int TotalUsers { get; set; }
        public int TotalClasses { get; set; }
        public int TotalShopItems { get; set; }
        
        // New stats - Additional metrics
        public int TotalAssignments { get; set; }
        public int TotalSubmissions { get; set; }
        public int TotalPosts { get; set; }
        public int ActiveLiveRooms { get; set; }  // Status = InProgress or NotStarted
    }
}
