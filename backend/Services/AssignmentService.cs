using System.Text.Json;
using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.AssignmentGroups;
using OnlineClassroomManagement.Models.Requests.Assignments;
using OnlineClassroomManagement.Models.Requests.Quizs;
using OnlineClassroomManagement.Models.Responses.Assignments;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAssignmentService
    {
        Task<AssignmentDetailResponse> CreateAssignment(CreateAssignmentRequest request, int classId);
        Task<AssignmentDetailResponse> UpdateAssignment(int classId, int assignmentId, UpdateAssignmentRequest request);
        Task DeleteAssignment(int assignmentId);
        Task<List<AssignmentResponse>> GetAllAssignments();
        Task<PaginatedList<AssignmentResponse>> GetListAssignments(GetPaginatedAssignmentsRequest request);
        Task<AssignmentResponse> GetAssignmentById(int assignmentId);
        Task<List<AssignmentResponse>> GetGroupAssignmentsByClassId(int classId);
        Task<List<AssignmentResponse>> GetAllAssignmentsByClassId(int classId);
        Task<PaginatedList<AssignmentResponse>> GetListAssignmentsByClassId(int classId, GetPaginatedAssignmentsRequest request);
        Task<AssignmentDetailResponse> GetAssignmentWithAnswersForTeacher(int assignmentId, int classId);
        Task<AssignmentDetailResponse> CreateAssignmentFromExcel(CreateAssignmentFromExcelRequest request, int classId);
        Task<AssignmentUnsubmittedCountResponse> GetCountAssignmentUnsubmittedByUserInClass(int classId);
        Task AllowShowResultToStudent(int assignmentId, AllowShowResultToStudentRequest request);
    }

    public class AssignmentService : IAssignmentService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IQuizQuestionService _quizQuestionService;
        private readonly IQuizOptionService _quizOptionService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IStorageService _storageService;
        private readonly INotificationService _notificationService;


        public AssignmentService(IRepository repository, IMapper mapper, IQuizQuestionService quizQuestionService, IQuizOptionService quizOptionService, ICurrentUserService currentUserService, IStorageService storageService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _quizQuestionService = quizQuestionService;
            _quizOptionService = quizOptionService;
            _currentUserService = currentUserService;
            _storageService = storageService;
            _notificationService = notificationService;
        }

        public async Task<AssignmentDetailResponse> CreateAssignment(CreateAssignmentRequest request, int classId)
        {
            Specification<Class> classSpec = new();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = ep => ep.Include(c => c.Members).ThenInclude(m => m.User);

            Class? targetClass = await _repository.GetAsync(classSpec);

            if (targetClass == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);
            }
            User? currentUser = await _currentUserService.GetCurrentUserInfo() ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Kiểm tra user có phải là member của class và có quyền tạo assignment
            ClassMember? classMember = targetClass.Members?.FirstOrDefault(m => m.User.Id == currentUser.Id);

            if (classMember == null)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.CreatorNotInClass);
            }

            // Chỉ Teacher mới có thể tạo assignment
            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.CreatorNotTeacher);
            }

            List<Document> attachments = new List<Document>();
            // Tạo Document attachments cho Assignment
            if (request.AttachedDocumentIds == null)
            {
                request.AttachedDocumentIds = new List<int>();
            }
            else if (request.AttachedDocumentIds.Count > 0)
            {
                //  Lấy danh sách Documents
                Specification<Document> docSpec = new();
                docSpec.Conditions.Add(d => request.AttachedDocumentIds.Contains(d.Id));

                List<Document> documents = await _repository.GetListAsync(docSpec);

                if (documents.Count == 0)
                {
                    throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.DocumentNotFound);
                }

                foreach (Document doc in documents)
                {
                    doc.ParentType = ParentType.Assignment;
                    attachments.Add(doc);
                }
            }

            // Tạo Assignment entity
            Assignment assignment = _mapper.Map<Assignment>(request);
            assignment.Attachments = attachments;
            assignment.Deadline = request.Deadline.ToUniversalTime();
            assignment.CreatedBy = classMember;
            assignment.CreatedAt = DateTime.UtcNow;
            assignment.UpdatedAt = DateTime.UtcNow;
            assignment.Status = AssignmentStatus.Assigned;

            // Xử lý Quiz nếu là assignment quiz
            if (request.Type == AssignmentType.Quiz && request.ListQuestions?.Any() == true)
            {
                // Tạo quiz questions
                List<QuizQuestion> quizQuestions = new List<QuizQuestion>();
                foreach (CreateQuizQuestionRequest questionRequest in request.ListQuestions)
                {
                    QuizQuestion question = await _quizQuestionService.CreateQuizQuestion(questionRequest);
                    quizQuestions.Add(question);
                }
                assignment.ListQuestions = quizQuestions;
            } else
            {
                assignment.ListQuestions = new List<QuizQuestion>();
            }

            // Lưu assignment vào database
            _repository.Add(assignment);



            // Tạo AssignmentInClass
            AssignmentInClass assignmentInClass = new AssignmentInClass
            {
                Assignment = assignment,
                Class = targetClass
            };
            _repository.Add(assignmentInClass);
            await _repository.SaveChangesAsync();

            // Notify students in class about the new assignment/quiz
            List<int> studentReceiverIds = targetClass.Members
                .Where(m => m.User != null && m.RoleInClass == RoleInClass.Student)
                .Select(m => m.User.Id)
                .Where(id => id != currentUser.Id)
                .Distinct()
                .ToList();

            if (studentReceiverIds.Count > 0)
            {
                string dueDateIso = assignment.Deadline.ToString("O");
                string type = request.Type == AssignmentType.Quiz ? "quiz_created" : "assignment_created";

                Dictionary<string, string> data = new Dictionary<string, string>
                {
                    { "title", assignment.Title ?? string.Empty },
                    { "className", targetClass.Name ?? string.Empty },
                    { "dueDate", dueDateIso }
                };

                if (request.Type == AssignmentType.Quiz)
                {
                    data["questionCount"] = (assignment.ListQuestions?.Count ?? 0).ToString();
                }

                string emailTitle = request.Type == AssignmentType.Quiz
                    ? $"[OCM] Bài kiểm tra mới: {assignment.Title}"
                    : $"[OCM] Bài tập mới: {assignment.Title}";
                string emailContent = request.Type == AssignmentType.Quiz
                    ? $"<p>Bài kiểm tra mới <b>{assignment.Title}</b> ({assignment.ListQuestions?.Count ?? 0} câu) đã được đăng trong lớp <b>{targetClass.Name}</b>.</p><p>Hạn nộp: <b>{assignment.Deadline:dd/MM/yyyy HH:mm}</b></p>"
                    : $"<p>Bài tập mới <b>{assignment.Title}</b> đã được đăng trong lớp <b>{targetClass.Name}</b>.</p><p>Hạn nộp: <b>{assignment.Deadline:dd/MM/yyyy HH:mm}</b></p>";

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = type,
                    Data = data,
                    SenderId = currentUser.Id,
                    ReceiverIds = studentReceiverIds,
                    LinkRedirect = $"/class/{targetClass.Id}/assignments/{assignment.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = true,
                    MailTitle = emailTitle,
                    MailHtmlContent = emailContent
                });
            }

            // Tạo response an toàn (không chứa đáp án)
            AssignmentDetailResponse response = _mapper.Map<AssignmentDetailResponse>(assignment);

            return response;
        }

        public async Task<AssignmentDetailResponse> CreateAssignmentFromExcel(CreateAssignmentFromExcelRequest request, int classId)
        {
            IFormFile excelFile = request.ExcelFile;
            // Validation
            if (excelFile == null || excelFile.Length == 0)
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelFileEmpty);

            string fileExtension = Path.GetExtension(excelFile.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelFormatInvalid);

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Kiểm tra lớp và quyền của user
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            ClassMember classMember = targetClass.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotInClass);

            if (classMember.RoleInClass != RoleInClass.Teacher)
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyTeacherCanCreateFromExcel);

            // Đọc file excel và parse dữ liệu
            List<CreateQuizQuestionRequest> quizQuestions = await ParseExcelToQuizQuestions(excelFile);

            if (!quizQuestions.Any())
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.ExcelNoValidQuestions);

            // Tính tổng điểm
            double totalScore = quizQuestions.Sum(q => q.Point);

            // Tạo Assignment
            CreateAssignmentRequest assignment = _mapper.Map<CreateAssignmentRequest>(request);
            assignment.Type = AssignmentType.Quiz;
            assignment.ListQuestions = quizQuestions;
            assignment.MaxScore = totalScore;

            return await CreateAssignment(assignment, classId);
        }

        public async Task<List<CreateQuizQuestionRequest>> ParseExcelToQuizQuestions(IFormFile excelFile)
        {
            List<CreateQuizQuestionRequest> questions = new List<CreateQuizQuestionRequest>();

            // Cài đặt license cho EPPlus (sử dụng NonCommercial cho mục đích học tập)
            // dotnet add package EPPlus --version 7.1.2
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
                        List<CreateQuizOptionRequest> options = new List<CreateQuizOptionRequest>();
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
                                options.Add(new CreateQuizOptionRequest
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
                        CreateQuizQuestionRequest question = new CreateQuizQuestionRequest
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

        public async Task<List<AssignmentResponse>> GetAllAssignments()
        {
            Specification<Assignment> spec = new();
            spec.Includes = q => q.Include(a => a.ListQuestions).ThenInclude(lq => lq.Options)
                                    .Include(a => a.Attachments);
            spec.OrderBy = q => q.OrderByDescending(a => a.CreatedAt);
            List<Assignment> assignments = await _repository.GetListAsync(spec);
            return _mapper.Map<List<AssignmentResponse>>(assignments);
        }

        public async Task<AssignmentResponse> GetAssignmentById(int assignmentId)
        {
            Specification<Assignment> spec = new();
            spec.Conditions.Add(a => a.Id == assignmentId);
            spec.Includes = q => q.Include(a => a.ListQuestions).ThenInclude(lq => lq.Options).Include(a => a.Attachments);

            Assignment? assignment = await _repository.GetAsync(spec);
            if (assignment == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);
            }

            return _mapper.Map<AssignmentResponse>(assignment);
        }

        public async Task<List<AssignmentResponse>> GetAllAssignmentsByClassId(int classId)
        {
            // Lấy thông tin user hiện tại
            User? currentUser = await _currentUserService.GetCurrentUserInfo();

            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic => aic.Class.Id == classId);
            spec.Includes = q => q.Include(aic => aic.Assignment)
                                    .ThenInclude(a => a.ListQuestions)
                                        .ThenInclude(q => q.Options)
                                    .Include(aic => aic.Assignment.Attachments)
                                    .Include(aic => aic.Submissions)
                                        .ThenInclude(s => s.SubmitBy)
                                            .ThenInclude(m => m.User);
            spec.OrderBy = q => q.OrderByDescending(aic => aic.Assignment.CreatedAt);

            List<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(spec);

            // Map và thêm SubmissionStatus cho từng assignment
            List<AssignmentResponse> assignmentResponses = new List<AssignmentResponse>();
            foreach (AssignmentInClass aic in assignmentInClasses)
            {
                AssignmentResponse assignmentResponse = _mapper.Map<AssignmentResponse>(aic.Assignment);

                // Nếu có currentUser, tìm submission của user này
                if (currentUser != null)
                {
                    Submission? userSubmission = aic.Submissions.FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id);
                    if (userSubmission != null)
                    {
                        assignmentResponse.SubmissionStatus = userSubmission.Status;
                    }
                    else
                    {
                        assignmentResponse.SubmissionStatus = SubmissionStatus.NotSubmitted;
                    }
                }

                assignmentResponses.Add(assignmentResponse);
            }

            return assignmentResponses;
        }

        public async Task<PaginatedList<AssignmentResponse>> GetListAssignmentsByClassId(int classId, GetPaginatedAssignmentsRequest request)
        {
            // Lấy thông tin user hiện tại
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            PaginationSpecification<AssignmentInClass> paginationSpecification = new PaginationSpecification<AssignmentInClass>();
            paginationSpecification.Conditions.Add(aic => aic.Class.Id == classId);
            
            // Filter by type if provided
            if (request.Type.HasValue)
            {
                paginationSpecification.Conditions.Add(aic => aic.Assignment.Type == request.Type.Value);
            }
            
            // Exclude type if provided
            if (request.ExcludeType.HasValue)
            {
                paginationSpecification.Conditions.Add(aic => aic.Assignment.Type != request.ExcludeType.Value);
            }
            
            paginationSpecification.Includes = q => q
                                            .Include(aic => aic.Assignment)
                                                .ThenInclude(a => a.ListQuestions)
                                                    .ThenInclude(q => q.Options)
                                            .Include(aic => aic.Assignment.Attachments)
                                            .Include(aic => aic.Submissions)
                                                .ThenInclude(s => s.SubmitBy)
                                                    .ThenInclude(m => m.User)
                                            .Include(aic => aic.Submissions)
                                                .ThenInclude(s => s.AssignmentGroup)
                                            .Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupMembers)
                                                .ThenInclude(m => m.Member)
                                                .ThenInclude(cm => cm.User);

            // Sắp xếp theo thời gian tạo (mới nhất đến cũ nhất)
            paginationSpecification.OrderBy = q => q.OrderByDescending(aic => aic.Assignment.CreatedAt);

            // phân trang
            paginationSpecification.PageSize = request.PageSize;
            paginationSpecification.PageIndex = request.PageNumber;

            PaginatedList<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(paginationSpecification);

            // Map và thêm SubmissionStatus cho từng assignment
            List<AssignmentResponse> assignmentResponses = new List<AssignmentResponse>();
            foreach (AssignmentInClass aic in assignmentInClasses.Items)
            {
                AssignmentResponse assignmentResponse = _mapper.Map<AssignmentResponse>(aic.Assignment);

                if (aic.Assignment.Type == AssignmentType.Group)
                {
                    AssignmentGroup? assignmentGroup = aic.AssignmentGroups
                        .FirstOrDefault(ag => ag.GroupMembers
                            .Any(m => m.Member.User.Id == currentUser.Id));
                    if (assignmentGroup == null)
                    {
                        assignmentResponse.SubmissionStatus = SubmissionStatus.NotSubmitted;
                        assignmentResponses.Add(assignmentResponse);
                        continue;
                    }
                    Submission? groupSubmission = aic.Submissions
                        .FirstOrDefault(s => s.AssignmentGroup != null && s.AssignmentGroup.Id == assignmentGroup.Id);
                    if (groupSubmission != null)
                    {
                        assignmentResponse.SubmissionStatus = groupSubmission.Status;        
                    }
                    else
                    {
                        assignmentResponse.SubmissionStatus = SubmissionStatus.NotSubmitted;
                    }
                }
                else {
                    Submission? userSubmission = aic.Submissions.FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id);
                    if (userSubmission != null)
                    {
                        assignmentResponse.SubmissionStatus = userSubmission.Status;
                    }
                    else
                    {
                        assignmentResponse.SubmissionStatus = SubmissionStatus.NotSubmitted;
                    }
                }

                assignmentResponses.Add(assignmentResponse);
            }

            PaginatedList<AssignmentResponse> response = new PaginatedList<AssignmentResponse>(
                assignmentResponses,
                assignmentInClasses.TotalItems,
                assignmentInClasses.PageIndex,
                assignmentInClasses.PageSize
            );

            return response;
        }

        public async Task<PaginatedList<AssignmentResponse>> GetListAssignments(GetPaginatedAssignmentsRequest request)
        {
            PaginationSpecification<Assignment> paginationSpecification = new PaginationSpecification<Assignment>();
            if (!string.IsNullOrEmpty(request.Title))
            {
                paginationSpecification.Conditions.Add(e => e.Title.ToLower().Contains(request.Title.ToLower()));
            }
            paginationSpecification.Includes = q => q.Include(a => a.Attachments).Include(a => a.ListQuestions).ThenInclude(lq => lq.Options);

            // Sắp xếp theo thời gian tạo (mới nhất đến cũ nhất)
            paginationSpecification.OrderBy = q => q.OrderByDescending(a => a.CreatedAt);

            paginationSpecification.PageSize = request.PageSize;
            paginationSpecification.PageIndex = request.PageNumber;

            PaginatedList<AssignmentResponse> response = await _repository.GetListAsync<Assignment, AssignmentResponse>(paginationSpecification, e => _mapper.Map<AssignmentResponse>(e));

            return response;
        }

        public async Task<AssignmentDetailResponse> UpdateAssignment(int classId, int assignmentId, UpdateAssignmentRequest request)
        {
            // 1. Validation
            User? currentUser = await _currentUserService.GetCurrentUserInfo() ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            if (request == null) throw new ArgumentNullException(nameof(request));
            if (string.IsNullOrWhiteSpace(request.Title))
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.AssignmentTitleRequired);
            if (request.MaxScore <= 0)
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.MaxScoreMustBePositive);

            // 2.1. Load class information for the assignment (including group members for Group assignments)
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Assignment.Id == assignmentId && aic.Class.Id == classId);
            assignmentInClassSpec.Includes = query => query
                .Include(aic => aic.Assignment)
                    .ThenInclude(a => a.ListQuestions)
                        .ThenInclude(q => q.Options)
                .Include(aic => aic.Assignment.Attachments)
                .Include(aic => aic.Assignment.CreatedBy)
                    .ThenInclude(m => m.User)
                .Include(aic => aic.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .Include(aic => aic.Submissions)
                    .ThenInclude(s => s.SubmitBy)
                        .ThenInclude(cm => cm.User)
                .Include(aic => aic.AssignmentGroups)
                    .ThenInclude(ag => ag.GroupMembers)
                        .ThenInclude(agm => agm.Member)
                            .ThenInclude(cm => cm.User);
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);
            Class? targetClass = assignmentInClass?.Class;

            if (targetClass == null)
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassRelatedNotFound);

            Assignment existingAssignment = assignmentInClass?.Assignment
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            // 3. Authorization check
            if (existingAssignment.CreatedBy.User.Id != currentUser.Id)
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyCreatorCanUpdate);

            // 4. Update Attachments
            List<Document> updatedAttachments = new List<Document>();
            if (request.AttachedDocumentIds == null)
            {
                request.AttachedDocumentIds = new List<int>();
            }
            else if (request.AttachedDocumentIds.Count > 0)
            {
                //  Lấy danh sách Documents
                Specification<Document> docSpec = new();
                docSpec.Conditions.Add(d => request.AttachedDocumentIds.Contains(d.Id));

                List<Document> documents = await _repository.GetListAsync(docSpec);

                if (documents.Count == 0)
                {
                    throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.DocumentNotFound);
                }

                foreach (Document doc in documents)
                {
                    doc.ParentType = ParentType.Assignment;
                    updatedAttachments.Add(doc);
                }
            }

            existingAssignment.Attachments = updatedAttachments;

            // 5. Handle Quiz Questions - Update existing, delete removed, add new
            if (request.Type == AssignmentType.Quiz)
            {
                if (request.ListQuestions?.Any() != true)
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.QuizMustHaveAtLeastOneQuestion);

                // Lấy danh sách requestId > 0
                List<int> questionIdsRequest = request.ListQuestions.Where(q => q.Id > 0)
                                                                    .Select(q => q.Id)
                                                                    .ToList();

                // 5.1. Remove questions không còn trong request

                // Lấy danh sách question cần xóa
                List<QuizQuestion> questionsToRemove = existingAssignment.ListQuestions
                    .Where(q => !questionIdsRequest.Contains(q.Id))
                    .ToList();
                foreach (QuizQuestion questionToRemove in questionsToRemove)
                {
                    existingAssignment.ListQuestions.Remove(questionToRemove);
                }


                // 5.2. Update existing questions
                foreach (UpdateQuizQuestionRequest questionRequest in request.ListQuestions)
                {
                    if (questionRequest.Id > 0)
                    {
                        await _quizQuestionService.UpdateQuizQuestion(questionRequest);
                    }
                    else
                    {
                        CreateQuizQuestionRequest createQuizQuestionRequest = _mapper.Map<CreateQuizQuestionRequest>(questionRequest);
                        QuizQuestion newQuestion = await _quizQuestionService.CreateQuizQuestion(createQuizQuestionRequest);
                        existingAssignment.ListQuestions.Add(newQuestion);
                    }


                }
            }
            else
            {
                // Clear questions for non-quiz assignments
                existingAssignment.ListQuestions.Clear();
            }

            // Store original type before mapping (in case request changes it)
            AssignmentType originalType = existingAssignment.Type;

            // 6. Map basic properties
            _mapper.Map(request, existingAssignment);
            existingAssignment.UpdatedAt = DateTime.UtcNow;
            if (request.Deadline.Kind != DateTimeKind.Utc)
                existingAssignment.Deadline = request.Deadline.ToUniversalTime();

            // 7. Save changes
            _repository.Update(existingAssignment);
            await _repository.SaveChangesAsync();

            // Notify students who have already submitted that the assignment was updated
            if (assignmentInClass != null && assignmentInClass.Submissions != null)
            {
                List<int> submitterIds = assignmentInClass.Submissions
                    .Where(s => s.SubmitBy?.User != null)
                    .Select(s => s.SubmitBy!.User!.Id)
                    .Where(id => id != currentUser.Id)
                    .Distinct()
                    .ToList();

                if (submitterIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "assignment_updated",
                        Data = new Dictionary<string, string>
                        {
                            { "title", existingAssignment.Title ?? string.Empty },
                            { "className", targetClass.Name ?? string.Empty }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = submitterIds,
                        LinkRedirect = $"/class/{targetClass.Id}/assignments/{existingAssignment.Id}",
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }

            // Notify group members if this is a Group assignment (use originalType in case request changed it)
            if (originalType == AssignmentType.Group)
            {
                // For Group assignments, notify all students in the class (not just group members)
                // because some students may not have joined a group yet
                List<int> studentIds = targetClass.Members
                    .Where(m => m.User != null && m.RoleInClass == RoleInClass.Student)
                    .Select(m => m.User!.Id)
                    .Where(id => id != currentUser.Id)
                    .Distinct()
                    .ToList();

                if (studentIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "assignment_group_updated",
                        Data = new Dictionary<string, string>
                        {
                            { "assignmentTitle", existingAssignment.Title ?? string.Empty },
                            { "className", targetClass.Name ?? string.Empty }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = studentIds,
                        LinkRedirect = $"/class/{targetClass.Id}/assignment-groups/{existingAssignment.Id}",
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }

            // 8. Return response
            return _mapper.Map<AssignmentDetailResponse>(existingAssignment);
        }
        
        public async Task DeleteAssignment(int assignmentId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo() ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Load class + member list for notifications before deleting
            Specification<AssignmentInClass> aicSpec = new();
            aicSpec.Conditions.Add(aic => aic.Assignment.Id == assignmentId);
            aicSpec.Includes = q => q
                .Include(aic => aic.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User);
            AssignmentInClass? aic = await _repository.GetAsync(aicSpec);

            Specification<Assignment> spec = new Specification<Assignment>();
            spec.Conditions.Add(a => a.Id == assignmentId);
            spec.Includes = q => q.Include(a => a.CreatedBy).ThenInclude(m => m.User)
                                  .Include(a => a.Attachments);

            Assignment? assignment = await _repository.GetAsync(spec)
            ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            if (assignment.CreatedBy.User.Id != currentUser.Id)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyCreatorCanDelete);
            }

            List<Document> attachments = assignment.Attachments;
            if (attachments != null && attachments.Count > 0)
            {
                foreach (Document doc in attachments)
                {
                    if (!string.IsNullOrEmpty(doc.FilePath))
                    {
                        try
                        {
                            await _storageService.DeleteFileAsync(doc.FilePath, Buckets.Documents);
                        }
                        catch
                        {
                            // Log lỗi nếu cần
                            throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.DeleteFileFromStorageFailed);
                        }
                    }
                }
            }

            _repository.Remove(assignment);
            await _repository.SaveChangesAsync();

            // Notify students that the assignment was deleted
            if (aic?.Class != null)
            {
                List<int> studentIds = aic.Class.Members
                    .Where(m => m.User != null && m.RoleInClass == RoleInClass.Student)
                    .Select(m => m.User.Id)
                    .Where(id => id != currentUser.Id)
                    .Distinct()
                    .ToList();

                if (studentIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "assignment_deleted",
                        Data = new Dictionary<string, string>
                        {
                            { "title", assignment.Title ?? string.Empty },
                            { "className", aic.Class.Name ?? string.Empty }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = studentIds,
                        LinkRedirect = $"/class/{aic.Class.Id}/assignments",
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }
        }

        public async Task<AssignmentDetailResponse> GetAssignmentWithAnswersForTeacher(int assignmentId, int classId)
        {
            // Lấy user hiện tại
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Kiểm tra user có phải teacher trong class này không
            // Lấy class để kiểm tra members
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class? classEntity = await _repository.GetAsync(classSpec);
            if (classEntity == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);
            }

            // Lấy assignment với đầy đủ thông tin bao gồm đáp án đúng
            Specification<Assignment> spec = new Specification<Assignment>();
            spec.Conditions.Add(a => a.Id == assignmentId);
            spec.Includes = q => q.Include(a => a.ListQuestions)
                                      .ThenInclude(q => q.Options)
                                  .Include(a => a.Attachments)
                                  .Include(a => a.CreatedBy);

            Assignment assignment = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            // Kiểm tra user có phải teacher trong class này không
            bool isTeacher = classEntity.Members.Any(m => m.User.Id == currentUser.Id && m.RoleInClass == RoleInClass.Teacher);
            if (!isTeacher && !assignment.AllowShowResultToStudent)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.TeacherNotAllowShowResult);
            }

            DateTime now = DateTime.UtcNow;
            if (!isTeacher && now <= assignment.Deadline)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.AssignmentNotYetFinished);
            }

            return _mapper.Map<AssignmentDetailResponse>(assignment);
        }

        public async Task<AssignmentUnsubmittedCountResponse> GetCountAssignmentUnsubmittedByUserInClass(int classId)
        {
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class existingClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic => aic.Class.Id == classId);
            spec.Includes = q => q.Include(aic => aic.Assignment)
                                    .Include(aic => aic.Submissions)
                                        .ThenInclude(s => s.SubmitBy)
                                            .ThenInclude(m => m.User)
                                    .Include(aic => aic.Submissions)
                                        .ThenInclude(s => s.AssignmentGroup)
                                            .ThenInclude(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                    .ThenInclude(cm => cm.User);

            List<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(spec);
            if (assignmentInClasses.Count == 0)
            {
                return new AssignmentUnsubmittedCountResponse { AssignmentUnsubmittedCount = 0, GroupAssignmentUnsubmittedCount = 0 };
            }

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            ClassMember classMember = existingClass.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id) 
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotInClass);
            
            if (classMember.RoleInClass != RoleInClass.Student)
            {
                return new AssignmentUnsubmittedCountResponse { AssignmentUnsubmittedCount = 0, GroupAssignmentUnsubmittedCount = 0 };
            }

            int assignmentUnsubmittedCount = 0;
            int groupAssignmentUnsubmittedCount = 0;
            foreach (AssignmentInClass aic in assignmentInClasses)
            {
                Submission? userSubmission = aic.Submissions.FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id || 
                    (s.AssignmentGroup != null && s.AssignmentGroup.GroupMembers.Any(m => m.Member.User.Id == currentUser.Id)));
                if ((userSubmission == null || userSubmission.Status == SubmissionStatus.NotSubmitted) && aic.Assignment.Status == AssignmentStatus.Assigned)
                {
                    if (aic.Assignment.Type == AssignmentType.Group)
                    {
                        groupAssignmentUnsubmittedCount++;
                    }
                    else
                    {
                        assignmentUnsubmittedCount++;
                    }
                }
            }
            
            return new AssignmentUnsubmittedCountResponse { AssignmentUnsubmittedCount = assignmentUnsubmittedCount, GroupAssignmentUnsubmittedCount = groupAssignmentUnsubmittedCount };
        }
    
        public async Task AllowShowResultToStudent(int assignmentId, AllowShowResultToStudentRequest request)
        {
            Specification<Assignment> spec = new Specification<Assignment>();
            spec.Conditions.Add(a => a.Id == assignmentId);
            Assignment? assignment = await _repository.GetAsync(spec);
            if (assignment == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);
            }
            assignment.AllowShowResultToStudent = request.AllowShowResultToStudent;
            assignment.UpdatedAt = DateTime.UtcNow;
            _repository.Update(assignment);
            await _repository.SaveChangesAsync();
        }

        public async Task<List<AssignmentResponse>> GetGroupAssignmentsByClassId(int classId)
        {
            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic =>
                aic.Class.Id == classId &&
                aic.Assignment.Type == AssignmentType.Group
            );
            spec.Includes = q => q.Include(aic => aic.AssignmentGroupTopics) 
                                .Include(aic => aic.AssignmentGroups) 
                                    .ThenInclude(ag => ag.GroupMembers) 
                                        .ThenInclude(agm => agm.Member) 
                                            .ThenInclude(cm => cm.User) 
                                .Include(aic => aic.Assignment.Attachments) 
                                .Include(aic => aic.Submissions) 
                                    .ThenInclude(s => s.SubmitBy) 
                                        .ThenInclude(m => m.User);

            List<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(spec);

            return assignmentInClasses
                .Select(aic => _mapper.Map<AssignmentResponse>(aic.Assignment))
                .ToList();
        }
    }
}