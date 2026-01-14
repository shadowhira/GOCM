using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Quiz;
using OnlineClassroomManagement.Models.Requests.Quizs;
using OnlineClassroomManagement.Models.Responses.Assignments;
using OnlineClassroomManagement.Models.Responses.Quizs;

namespace OnlineClassroomManagement.Helper.Mapping
{
    public class QuizMappingProfile : Profile
    {
        public QuizMappingProfile()
        {
            // Create QuizOption: Request → Entity
            CreateMap<CreateQuizOptionRequest, QuizOption>();


            // Update QuizOption: Entity → Entity (for update operations)
            CreateMap<QuizOption, QuizOption>();

            // Convert back: Entity → Request DTO
            CreateMap<QuizOption, CreateQuizOptionRequest>();

            // Response: Entity → Response DTO (SECURE - excludes IsCorrect)
            CreateMap<QuizOption, QuizOptionResponse>();

            // Create QuizQuestion: Request → Entity
            CreateMap<CreateQuizQuestionRequest, QuizQuestion>();

            // Update QuizQuestion: Request → Entity
            CreateMap<UpdateQuizQuestionRequest, QuizQuestion>()
            .ForMember(dest => dest.Options, opt => opt.Ignore())
            .ForMember(dest => dest.Answers, opt => opt.Ignore());

            CreateMap<UpdateQuizQuestionRequest, CreateQuizQuestionRequest>();

            // Response: Entity → Response DTO (SECURE - excludes Answer)
            CreateMap<QuizQuestion, QuizQuestionResponse>();

            // Create Quiz: Request → Entity
            CreateMap<CreateQuizAnswerRequest, QuizAnswer>()
            .ForMember(dest => dest.AnsweredAt, opt => opt.MapFrom(src => src.AnsweredAt.ToUniversalTime()));

            CreateMap<QuizAnswer, QuizAnswerResponse>();
        }
    }
}