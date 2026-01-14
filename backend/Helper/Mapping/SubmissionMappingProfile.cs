using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Grades;
using OnlineClassroomManagement.Models.Requests.Submissions;
using OnlineClassroomManagement.Models.Responses.Grades;
using OnlineClassroomManagement.Models.Responses.Submissions;

namespace OnlineClassroomManagement.Helper.Mapping
{
    public class SubmissionMappingProfile : Profile
    {
        public SubmissionMappingProfile()
        {
            // Submission: Request → Entity
            CreateMap<CreateSubmissionRequest, Submission>();
            CreateMap<UpdateSubmissionRequest, Submission>();
            
            // Grade: Entity → Response DTO
            CreateMap<Grade, GradeResponse>()
                .ForMember(dest => dest.GradedById, opt => opt.MapFrom(src => src.GradedBy != null ? src.GradedBy.Id : (int?)null));

            // Submission: Entity → Response DTO
            CreateMap<Submission, SubmissionResponse>()
                .ForMember(dest => dest.SubmitByName, opt => opt.MapFrom(src => src.SubmitBy != null && src.SubmitBy.User != null ? src.SubmitBy.User.DisplayName : null))
                .ForMember(dest => dest.SubmitById, opt => opt.MapFrom(src => src.SubmitBy != null ? src.SubmitBy.Id : (int?)null))
                .ForMember(dest => dest.SubmitByAvatarUrl, opt => opt.MapFrom(src => src.SubmitBy != null && src.SubmitBy.User != null ? src.SubmitBy.User.AvatarUrl : null))
                .ForMember(dest => dest.SubmitByEmail, opt => opt.MapFrom(src => src.SubmitBy != null && src.SubmitBy.User != null ? src.SubmitBy.User.Email : null))
                .ForMember(dest => dest.Grade, opt => opt.MapFrom(src => src.Grade));

            // Submission: Entity → Create Response DTO (không chứa Grade và Answers)
            CreateMap<Submission, CreateSubmissionResponse>();
            
            CreateMap<CreateGradeRequest, Grade>();
        }
    }
}