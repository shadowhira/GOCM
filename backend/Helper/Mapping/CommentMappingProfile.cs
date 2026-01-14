using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Comments;
using OnlineClassroomManagement.Models.Responses.Comments;

namespace OnlineClassroomManagement.Helper.MappingProfile
{
    public class CommentMappingProfile : Profile
    {
        public CommentMappingProfile()
        {
            CreateMap<Comment, CommentResponse>()
                .ForMember(dest => dest.ParentCommentId,
                    opt => opt.MapFrom(src => src.ParentCommentId));

            CreateMap<CreateCommentRequest, Comment>();
            CreateMap<UpdateCommentRequest, Comment>();

            CreateMap<Comment, CommentReplyPreviewResponse>();
        }
    }
}
