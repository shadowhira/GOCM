using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Comments;
using OnlineClassroomManagement.Models.Responses.Comments;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    public class CommentController : ApiControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpGet("List")]
        public async Task<PaginatedList<CommentResponse>> GetPaginatedComments([FromQuery] GetPaginatedCommentsRequest request)
        {
            return await _commentService.GetListComments(request);
        }

        [HttpGet("{id}")]
        public async Task<CommentResponse> GetCommentById(int id)
        {
            return await _commentService.GetCommentById(id);
        }

        [HttpPost()]
        public async Task CreateComment(CreateCommentRequest request)
        {
            await _commentService.CreateComment(request);
        }

        [HttpPut()]
        public async Task UpdateComment(UpdateCommentRequest request)
        {
            await _commentService.UpdateComment(request);
        }

        [HttpDelete("{id}")]
        public async Task DeleteComment(int id)
        {
            await _commentService.DeleteComment(id);
        }
    }
}
