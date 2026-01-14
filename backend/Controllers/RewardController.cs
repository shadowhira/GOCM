using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Requests.LiveRooms;
using OnlineClassroomManagement.Models.Requests.Rewards;
using OnlineClassroomManagement.Models.Responses.Rewards;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class RewardController : ApiControllerBase
    {
        private readonly IRewardService _rewardService;

        public RewardController(IRewardService rewardService)
        {
            _rewardService = rewardService;
        }

        [HttpPost("classes/{classId}/posts/{postId}/rewards")]
        public async Task<RewardActivityResponse> GrantPostReward(int classId, int postId, [FromBody] GrantRewardRequest request)
        {
            return await _rewardService.GrantPostRewardAsync(classId, postId, request);
        }

        [HttpPost("classes/{classId}/comments/{commentId}/rewards")]
        public async Task<RewardActivityResponse> GrantCommentReward(int classId, int commentId, [FromBody] GrantRewardRequest request)
        {
            return await _rewardService.GrantCommentRewardAsync(classId, commentId, request);
        }

        [HttpPost("live-rooms/{liveRoomId}/participants/{participantId}/rewards")]
        public async Task<RewardActivityResponse> GrantParticipantReward(int liveRoomId, int participantId, [FromBody] GrantLiveRoomParticipantRewardRequest request)
        {
            return await _rewardService.GrantParticipantRewardAsync(liveRoomId, participantId, request);
        }
    }
}
