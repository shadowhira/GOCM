
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class AssignmentGroupController : ApiControllerBase
    {
        private readonly IAssignmentGroupService _assignmentGroupService;

        public AssignmentGroupController(IAssignmentGroupService assignmentGroupService)
        {
            _assignmentGroupService = assignmentGroupService;
        }

        [HttpPost("classes/{classId}/assignments/{assignmentId}")]
        public async Task<AssignmentGroupResponse> CreateAssignmentGroup(
            [FromBody] CreateAssignmentGroupRequest request, int classId, int assignmentId)
        {
            AssignmentGroupResponse response = await _assignmentGroupService.CreateAssignmentGroup(request, assignmentId, classId);
            return response;
        }

        [HttpPost("{assignmentGroupId}/leave")]
        public async Task LeaveAssignmentGroup(int assignmentGroupId)
        {
            await _assignmentGroupService.LeaveAssignmentGroup(assignmentGroupId);
        }

        [HttpPost("{assignmentGroupId}/join")]
        public async Task JoinAssignmentGroup(int assignmentGroupId)
        {
            await _assignmentGroupService.JoinAssignmentGroup(assignmentGroupId);
        }

        [HttpPost("{assignmentGroupId}/members/{memberId}/invite")]
        public async Task InviteMemberToAssignmentGroup(int assignmentGroupId, int memberId)
        {
            await _assignmentGroupService.InviteMemberToAssignmentGroup(assignmentGroupId, memberId);
        }

        [HttpPost("{assignmentGroupId}/members/{memberId}/remove")]
        public async Task RemoveMemberFromGroup(int assignmentGroupId, int memberId)
        {
            await _assignmentGroupService.RemoveMemberFromGroup(assignmentGroupId, memberId);
        }

        [HttpPost("{assignmentGroupId}/members/{memberId}/transfer-leadership")]
        public async Task TransferLeadership(int assignmentGroupId, int memberId)
        {
            await _assignmentGroupService.TransferLeadership(assignmentGroupId, memberId);
        }

        [HttpPut("{assignmentGroupId}")]
        public async Task<AssignmentGroupResponse> UpdateAssignmentGroup(
            [FromBody] UpdateAssignmentGroupRequest request, int assignmentGroupId)
        {
            AssignmentGroupResponse response = await _assignmentGroupService.UpdateAssignmentGroup(request, assignmentGroupId);
            return response;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/All")]
        public async Task<List<AssignmentGroupResponse>> GetAllAssignmentGroupsForAssignment(int assignmentId, int classId)
        {
            List<AssignmentGroupResponse> responses = await _assignmentGroupService.GetAllAssignmentGroupsForAssignment(assignmentId, classId);
            return responses;
        }

        [HttpGet("{assignmentGroupId}")]
        public async Task<AssignmentGroupResponse> GetAssignmentGroupById(int assignmentGroupId)
        {
            AssignmentGroupResponse response = await _assignmentGroupService.GetAssignmentGroupById(assignmentGroupId);
            return response;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/my-group")]
        public async Task<AssignmentGroupResponse> GetMyAssignmentGroup(int assignmentId, int classId)
        {
            AssignmentGroupResponse response = await _assignmentGroupService.GetMyAssignmentGroup(assignmentId, classId);
            return response;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/approval-requests")]
        public async Task<List<AssignmentGroupApprovalRequestResponse>> GetAllApprovalRequestInAssignmentGroup(int assignmentId, int classId)
        {
            List<AssignmentGroupApprovalRequestResponse> response = await _assignmentGroupService.GetAllApprovalRequestInAssignmentGroup(assignmentId, classId);
            return response;
        }

        [HttpPost("{assignmentGroupId}/request-approval")]
        public async Task RequestAssignmentGroupApproval(int assignmentGroupId, int topicId)
        {
            await _assignmentGroupService.RequestAssignmentGroupApproval(assignmentGroupId, topicId);
        }

        [HttpPost("assignmentGroupApprovalRequest/{approvalRequestId}/accept")]
        public async Task AcceptRequestCreateAssignmentGroup(int approvalRequestId)
        {
            await _assignmentGroupService.AcceptRequestCreateAssignmentGroup(approvalRequestId);
        }

        [HttpPost("assignmentGroupApprovalRequest/{approvalRequestId}/reject")]
        public async Task RejectRequestCreateAssignmentGroup(int approvalRequestId, [FromBody] RejectAssignmentGroupRequest request)
        {
            await _assignmentGroupService.RejectRequestCreateAssignmentGroup(approvalRequestId, request.Reason);
        }
    }
}
