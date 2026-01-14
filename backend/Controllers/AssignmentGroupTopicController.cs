using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Requests.AssignmentGroupTopics;
using OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class AssignmentGroupTopicController : ApiControllerBase
    {
        private readonly IAssignmentGroupTopicService _assignmentGroupTopicService;

        public AssignmentGroupTopicController(IAssignmentGroupTopicService assignmentGroupTopicService)
        {
            _assignmentGroupTopicService = assignmentGroupTopicService;
        }

        [HttpPost("classes/{classId}/assignments/{assignmentId}/group-topics")]
        public async Task<AssignmentGroupTopicResponse> CreateAssignmentGroupTopic(
            [FromBody] CreateAssignmentGroupTopicRequest request, int classId, int assignmentId)
        {
            return await _assignmentGroupTopicService.CreateAssignmentGroupTopic(request, assignmentId, classId);
        }

        [HttpPut("{topicId}")]
        public async Task<AssignmentGroupTopicResponse> UpdateAssignmentGroupTopic(
            [FromBody] UpdateAssignmentGroupTopicRequest request, int topicId)
        {
            return await _assignmentGroupTopicService.UpdateAssignmentGroupTopic(topicId, request);
        }

        [HttpDelete("{topicId}")]
        public async Task DeleteAssignmentGroupTopic(int topicId)
        {
            await _assignmentGroupTopicService.DeleteAssignmentGroupTopic(topicId);
        }

        [HttpGet("{topicId}")]
        public async Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicById(int topicId)
        {
            return await _assignmentGroupTopicService.GetAssignmentGroupTopicById(topicId);
        }

        [HttpGet("groups/{groupId}/topic")]
        public async Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicByGroupId(int groupId)
        {
            return await _assignmentGroupTopicService.GetAssignmentGroupTopicByGroupId(groupId);
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/group-topics")]
        public async Task<List<AssignmentGroupTopicResponse>> GetAllAssignmentGroupTopics(int classId, int assignmentId)
        {
            return await _assignmentGroupTopicService.GetAllAssignmentGroupTopics(assignmentId, classId);
        }
    }
}