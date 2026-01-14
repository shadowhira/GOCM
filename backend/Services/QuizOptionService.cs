using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Quizs;
using TanvirArjel.EFCore.GenericRepository;
using Common.Exceptions;
using OnlineClassroomManagement.Helper.Exceptions;
using OnlineClassroomManagement.Helper.Constants;
using AutoMapper;
using OnlineClassroomManagement.Models.Responses.Quizs;

namespace OnlineClassroomManagement.Services
{
    public interface IQuizOptionService
    {
        Task<QuizOption> CreateQuizOption(CreateQuizOptionRequest request);
        Task<QuizOption> UpdateQuizOption(QuizOption request);
        Task DeleteQuizOption(int optionId);
        Task<QuizOptionResponse> GetQuizOptionById(int optionId);
        Task<List<QuizOptionResponse>> GetQuizOptionsByQuestionId(int questionId);
    }

    public class QuizOptionService : IQuizOptionService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public QuizOptionService(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }
        public Task<QuizOption> CreateQuizOption(CreateQuizOptionRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (string.IsNullOrWhiteSpace(request.OptionText))
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.OptionTextRequired);
            }

            QuizOption option = _mapper.Map<QuizOption>(request);
            return Task.FromResult(option);
        }

        public async Task<QuizOption> UpdateQuizOption(QuizOption request)
        {
            Specification<QuizOption> spec = new Specification<QuizOption>();
            spec.Conditions.Add(q => q.Id == request.Id);

            QuizOption? existingOption = await _repository.GetAsync(spec);
            if (existingOption == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.OptionNotFound);
            }
            if (string.IsNullOrWhiteSpace(request.OptionText))
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.OptionTextRequired);
            }

            // Update thông tin
            _mapper.Map(request, existingOption);

            return existingOption;
        }

        public async Task DeleteQuizOption(int optionId)
        {
            if (optionId <= 0)
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.InvalidId);
            }

            Specification<QuizOption> spec = new Specification<QuizOption>();
            spec.Conditions.Add(q => q.Id == optionId);

            QuizOption? option = await _repository.GetAsync(spec);
            if (option == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.OptionNotFound);
            }

            _repository.Remove(option);
            await _repository.SaveChangesAsync();
        }

        public async Task<QuizOptionResponse> GetQuizOptionById(int optionId)
        {
            Specification<QuizOption> spec = new Specification<QuizOption>();
            spec.Conditions.Add(q => q.Id == optionId);

            QuizOption? option = await _repository.GetAsync(spec);

            if (option == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.OptionNotFound);
            }

            return _mapper.Map<QuizOptionResponse>(option);
        }

        public async Task<List<QuizOptionResponse>> GetQuizOptionsByQuestionId(int questionId)
        {
            Specification<QuizQuestion> spec = new Specification<QuizQuestion>();
            spec.Conditions.Add(o => o.Id == questionId);

            QuizQuestion? question = await _repository.GetAsync(spec);
            if (question == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.QuestionNotFound);
            }
            List<QuizOptionResponse> options = _mapper.Map<List<QuizOptionResponse>>(question.Options);
            return options;
        }
    }
}