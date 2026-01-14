using System.ComponentModel.DataAnnotations;

namespace OnlineClassroomManagement.Models.Requests.AssignmentGroupTopics
{
    public class CreateAssignmentGroupTopicRequest
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public int MaxGroupsPerTopic { get; set; }
        public string? Description { get; set; }
        public int MaxMembers { get; set; }
        public int MinMembers { get; set; }
    }
}