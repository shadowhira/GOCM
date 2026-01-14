using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class AssignmentGroupInvitationController : ApiControllerBase
    {
        private readonly IAssignmentGroupInvitationService _assignmentGroupInvitationService;

        public AssignmentGroupInvitationController(IAssignmentGroupInvitationService assignmentGroupInvitationService)
        {
            _assignmentGroupInvitationService = assignmentGroupInvitationService;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/invitations-received")]
        public async Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForToMemberInAssignment(int classId, int assignmentId)
        {
            List<AssignmentGroupInvitationResponse> responses = await _assignmentGroupInvitationService.GetListInvitationForToMemberInAssignment(classId, assignmentId);
            return responses;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/invitations-sent")]
        public async Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForFromMemberInAssignment(int classId, int assignmentId)
        {
            List<AssignmentGroupInvitationResponse> responses = await _assignmentGroupInvitationService.GetListInvitationForFromMemberInAssignment(classId, assignmentId);
            return responses;
        }

        [HttpPost("invitations/{invitationId}/accept")]
        public async Task AcceptInvitation(int invitationId)
        {
            await _assignmentGroupInvitationService.AcceptInvitation(invitationId);
        }

        [HttpPost("invitations/{invitationId}/reject")]
        public async Task RejectInvitation(int invitationId)
        {
            await _assignmentGroupInvitationService.RejectInvitation(invitationId);
        }

        [HttpDelete("invitations/{invitationId}/cancel")]
        public async Task CancelInvitation(int invitationId)
        {
            await _assignmentGroupInvitationService.CancelInvitation(invitationId);
        }
    }
}