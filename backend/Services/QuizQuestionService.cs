using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Quizs;
using TanvirArjel.EFCore.GenericRepository;
using Common.Exceptions;
using OnlineClassroomManagement.Helper.Exceptions;
using AutoMapper;
using OnlineClassroomManagement.Helper.Constants;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;

namespace OnlineClassroomManagement.Services
{
    public interface IQuizQuestionService
    {
        Task<QuizQuestion> CreateQuizQuestion(CreateQuizQuestionRequest request);
        Task<QuizQuestion> UpdateQuizQuestion(UpdateQuizQuestionRequest request);
        Task DeleteQuizQuestion(int questionId);
        Task<QuizQuestion> GetQuizQuestionById(int questionId);
        Task<List<QuizQuestion>> GetQuizQuestionsByAssignmentId(int assignmentId);
        Task<List<QuizQuestion>> CreateQuizQuestionsFromExcel(IFormFile excelFile);
    }

    public class QuizQuestionService : IQuizQuestionService
    {
        private readonly IRepository _repository;
        private readonly IQuizOptionService _quizOptionService;
        private readonly IMapper _mapper;

        public QuizQuestionService(IRepository repository, IMapper mapper, IQuizOptionService quizOptionService)
        {
            _repository = repository;
            _mapper = mapper;
            _quizOptionService = quizOptionService;
        }

        public async Task<QuizQuestion> CreateQuizQuestion(CreateQuizQuestionRequest request)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            if (string.IsNullOrWhiteSpace(request.QuestionText))
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.QuestionTextRequired);
            }

            if (request.Options == null || !request.Options.Any())
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.MinOneOption);
            }

            // Tạo QuizQuestion entity
            QuizQuestion quizQuestion = _mapper.Map<QuizQuestion>(request);
            quizQuestion.Options = new List<QuizOption>();

            // Tạo options cho question
            foreach (CreateQuizOptionRequest optionRequest in request.Options)
            {
                QuizOption option = await _quizOptionService.CreateQuizOption(optionRequest);
                quizQuestion.Options.Add(option);
            }     

            // Validation: phải có ít nhất một đáp án đúng
            if (!quizQuestion.Options.Any(o => o.IsCorrect))
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.MinOneCorrectOption);
            }

            // Validation bổ sung: nếu là SingleChoice thì chỉ được phép có đúng 1 đáp án đúng
            if (quizQuestion.QuestionType == QuestionType.SingleChoice &&
                quizQuestion.Options.Count(o => o.IsCorrect) > 1)
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.SingleChoiceOneCorrect);
            }

            return quizQuestion;
        }

        public async Task<QuizQuestion> UpdateQuizQuestion(UpdateQuizQuestionRequest request)
        {
            Specification<QuizQuestion> spec = new Specification<QuizQuestion>();
            spec.Conditions.Add(q => q.Id == request.Id);
            spec.Includes = q => q.Include(qq => qq.Options);

            QuizQuestion? existingQuestion = await _repository.GetAsync(spec);
            if (existingQuestion == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.QuestionNotFound);
            }

            // Validation basic fields
            if (string.IsNullOrWhiteSpace(request.QuestionText))
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.QuestionTextRequired);
            }

            if (request.Options == null || !request.Options.Any())
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.MinOneOption);
            }

            // Update thông tin cơ bản using mapper
            _mapper.Map(request, existingQuestion);

            if (request.Options != null)
            {
                // Lấy danh sách Ids của option có Id > 0
                List<int> optionIdsRequest = request.Options.Where(o => o.Id > 0)
                                                            .Select(o => o.Id)
                                                            .ToList();

                // Lấy danh sách các option cần xóa
                List<QuizOption> optionsToRemove = existingQuestion.Options.Where(o => !optionIdsRequest.Contains(o.Id)).ToList();
                foreach (QuizOption optionToRemove in optionsToRemove)
                {
                    existingQuestion.Options.Remove(optionToRemove);
                }

                // Update hoặc thêm mới options
                foreach (QuizOption optionRequest in request.Options)
                {
                    if (optionRequest.Id > 0)
                    {
                        await _quizOptionService.UpdateQuizOption(optionRequest);   
                    }
                    else
                    {
                        // Tạo QuizOption mới và add vào existingQuestion
                        CreateQuizOptionRequest createRequest = _mapper.Map<CreateQuizOptionRequest>(optionRequest);
                        QuizOption newOption = await _quizOptionService.CreateQuizOption(createRequest);
                        existingQuestion.Options.Add(newOption);
                    }
                }
                // Validation: phải có ít nhất một đáp án đúng
                if (!existingQuestion.Options.Any(o => o.IsCorrect))
                {
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.MinOneCorrectOption);
                }

                // Validation bổ sung: nếu là SingleChoice thì chỉ được phép có đúng 1 đáp án đúng
                if (existingQuestion.QuestionType == QuestionType.SingleChoice &&
                    existingQuestion.Options.Count(o => o.IsCorrect) > 1)
                {
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.SingleChoiceOneCorrect);
                }

            }

            return existingQuestion;
        }

        public async Task DeleteQuizQuestion(int questionId)
        {
            Specification<QuizQuestion> spec = new Specification<QuizQuestion>();
            spec.Conditions.Add(q => q.Id == questionId);
            spec.Includes = query => query.Include(q => q.Options);

            QuizQuestion? question = await _repository.GetAsync(spec);
            if (question == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.QuestionNotFound);
            }

            // Xóa tất cả options trước (chỉ remove khỏi context, chưa save)
            foreach (QuizOption option in question.Options)
            {
                _repository.Remove(option);
            }

            // Xóa question
            _repository.Remove(question);
            
            // Save tất cả changes cùng một lúc (transaction)
            await _repository.SaveChangesAsync();
        }

        public async Task<QuizQuestion> GetQuizQuestionById(int questionId)
        {
            Specification<QuizQuestion> spec = new Specification<QuizQuestion>();
            spec.Conditions.Add(q => q.Id == questionId);
            spec.Includes = query => query.Include(q => q.Options);

            QuizQuestion? question = await _repository.GetAsync(spec);
            if (question == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.QuestionNotFound);
            }

            return question;
        }

        public async Task<List<QuizQuestion>> GetQuizQuestionsByAssignmentId(int assignmentId)
        {
            // Query through Assignment entity since QuizQuestion doesn't have direct Assignment reference
            Specification<Assignment> spec = new Specification<Assignment>();
            spec.Conditions.Add(a => a.Id == assignmentId);
            spec.Includes = query => query.Include(a => a.ListQuestions).ThenInclude(q => q.Options);

            Assignment? assignment = await _repository.GetAsync(spec);
            if (assignment == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);
            }

            return assignment.ListQuestions.ToList();
        }

        public async Task<List<QuizQuestion>> CreateQuizQuestionsFromExcel(IFormFile excelFile)
        {
            List<QuizQuestion> questions = new List<QuizQuestion>();

            // Validation
            if (excelFile == null || excelFile.Length == 0)
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelFileEmpty);

            string fileExtension = Path.GetExtension(excelFile.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelFormatInvalid);

            // Cài đặt license cho EPPlus (sử dụng NonCommercial cho mục đích học tập)
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                await excelFile.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    // Lấy sheet đầu tiên
                    if (package.Workbook.Worksheets.Count == 0)
                        throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelNoValidSheet);

                    ExcelWorksheet worksheet = package.Workbook.Worksheets[0];
                    if (worksheet.Dimension == null)
                        return questions;

                    int rowCount = worksheet.Dimension.Rows;

                    // Format Excel
                    // Row 1: Header (QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption, Point)
                    // Row 2 trở đi: Dữ liệu câu hỏi

                    for (int row = 2; row <= rowCount; row++)
                    {
                        // Đọc dữ liệu từ từng cột
                        string questionText = worksheet.Cells[row, 1].Text.Trim();
                        string optionA = worksheet.Cells[row, 2].Text.Trim();
                        string optionB = worksheet.Cells[row, 3].Text.Trim();
                        string optionC = worksheet.Cells[row, 4].Text.Trim();
                        string optionD = worksheet.Cells[row, 5].Text.Trim();
                        string correctOption = worksheet.Cells[row, 6].Text.Trim();
                        if (string.IsNullOrWhiteSpace(correctOption))
                            throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelCorrectAnswerEmpty);
                        string pointText = worksheet.Cells[row, 7].Text.Trim();
                        if (string.IsNullOrWhiteSpace(pointText))
                            throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelPointInvalid);

                        if (!double.TryParse(pointText, out double point) || point <= 0)
                        {
                            throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelPointInvalid);
                        }

                        // Tạo danh sách options
                        List<QuizOption> options = new List<QuizOption>();
                        foreach (var (optionText, optionLabel) in new List<(string, string)>
                        {
                            (optionA, "A"),
                            (optionB, "B"),
                            (optionC, "C"),
                            (optionD, "D")
                        })
                        {
                            List<string> correctOptions = correctOption.Split(',')
                                    .Select(x => x.Trim().ToUpper())
                                    .ToList();

                            if (!string.IsNullOrWhiteSpace(optionText))
                            {
                                options.Add(new QuizOption
                                {
                                    OptionText = optionText,
                                    IsCorrect = correctOptions.Contains(optionLabel)
                                });
                            }
                        }

                        // Validate phải có ít nhất 2 option
                        if (options.Count < 2)
                        {
                            throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelMinOptions);
                        }

                        // Validate có ít nhất một đáp án đúng
                        if (!options.Any(o => o.IsCorrect))
                        {
                            throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelMinCorrectOption);
                        }

                        // Tạo Question
                        QuizQuestion question = new QuizQuestion
                        {
                            QuestionText = questionText,
                            Point = point,
                            Options = options
                        };

                        // Thêm loại câu hỏi
                        question.QuestionType = options.Count(o => o.IsCorrect) == 1
                            ? QuestionType.SingleChoice
                            : QuestionType.MultipleChoice;

                        questions.Add(question);
                    }
                }
            }
            return questions;
        }
    }
}