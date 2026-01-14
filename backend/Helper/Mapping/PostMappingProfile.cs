using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Posts;
using OnlineClassroomManagement.Models.Responses.Posts;

namespace OnlineClassroomManagement.Helper.MappingProfile
{
    public class PostMappingProfile : Profile
    {
        public PostMappingProfile()
        {
            // Post mappings
            CreateMap<Post, PostResponse>();
            CreateMap<UpdatePostRequest, Post>();
            CreateMap<CreatePostRequest, Post>();
        }
    }
}
