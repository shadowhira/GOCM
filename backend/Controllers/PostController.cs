using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Requests.Posts;
using OnlineClassroomManagement.Models.Responses.Posts;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    public class PostController : ApiControllerBase
    {
        private readonly IPostService _postService;
        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        // GET api/Post/All
        [HttpGet("All")]
        public async Task<List<PostResponse>> GetAllPosts()
        {
            return await _postService.GetAllPosts();
        }

        // GET api/Post/List
        [HttpGet("List")]
        public async Task<PaginatedList<PostResponse>> GetListPosts([FromQuery] GetPaginatedPostsRequest request)
        {
            return await _postService.GetListPosts(request);
        }

        // GET api/Post/{id}
        [HttpGet("{id}")]
        public Task<PostResponse> GetPostById(int id)
        {
            return _postService.GetPostById(id);
        }

        // POST api/Post
        [HttpPost]
        public async Task CreatePost([FromBody] CreatePostRequest request)
        {
            await _postService.CreatePost(request);
        }

        // PUT api/Post
        [HttpPut]
        public async Task UpdatePost([FromBody] UpdatePostRequest request)
        {
            await _postService.UpdatePost(request);
        }

        // DELETE api/Post/{id}
        [HttpDelete("{id}")]
        public async Task DeletePost(int id)
        {
            await _postService.DeletePost(id);
        }
    }
}
