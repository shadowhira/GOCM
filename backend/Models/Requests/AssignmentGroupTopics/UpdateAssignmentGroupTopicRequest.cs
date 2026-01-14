namespace OnlineClassroomManagement.Models.Requests.AssignmentGroupTopics
{
    public class UpdateAssignmentGroupTopicRequest
    {
        public string? Title { get; set; }
        public int? MaxGroupsPerTopic { get; set; }
        public string? Description { get; set; }
        public int? MaxMembers { get; set; }
        public int? MinMembers { get; set; }
    }
}