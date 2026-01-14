using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Submissions;
using OnlineClassroomManagement.Models.Requests.Grades;
using System.Linq;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Models.Responses.Submissions;
using OnlineClassroomManagement.Models.Requests.Quiz;
using OnlineClassroomManagement.Models.Responses.Grades;
using OnlineClassroomManagement.Models.Requests;

namespace OnlineClassroomManagement.Services
{
    public interface ISubmissionService
    {
        Task<CreateSubmissionResponse> CreateSubmission(CreateSubmissionRequest submission, int assignmentId, int classId);
        Task<SubmissionResponse> UpdateSubmission(UpdateSubmissionRequest submission, int assignmentId, int classId);
        Task<bool> CancelSubmission(int submissionId, int assignmentId);
        Task<List<SubmissionResponse>> GetSubmissionsByAssignmentId(int assignmentId);
        Task<List<SubmissionResponse>> GetSubmissionsByAssignmentAndClass(int assignmentId, int classId);
        Task<SubmissionResponse> GetSubmissionById(int submissionId);
        Task<CreateSubmissionResponse> GetSafeSubmissionForStudent(int assignmentId, int classId);
        Task<List<SubmissionResponse>> GetUngradedEssaySubmissions();
    }


    public class SubmissionService : ISubmissionService
    {
        private readonly IMapper _mapper;
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IRewardService _rewardService;
        private readonly INotificationService _notificationService;

        public SubmissionService(IMapper mapper, IRepository repository, ICurrentUserService currentUserService, IRewardService rewardService, INotificationService notificationService)
        {
            _mapper = mapper;
            _repository = repository;
            _currentUserService = currentUserService;
            _rewardService = rewardService;
            _notificationService = notificationService;
        }

        public async Task<CreateSubmissionResponse> CreateSubmission(CreateSubmissionRequest submission, int assignmentId, int classId)
        {
            // Lấy thông tin user hiện tại
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Lấy class có classId kèm danh sách member và user trong member
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q
                .Include(c => c.Members)
                    .ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound); 

            // Tìm ClassMember của user trong class
            ClassMember submitBy = targetClass.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.UserNotInClass);

            // Tìm Assignment
            Specification<Assignment> assignmentSpec = new Specification<Assignment>();
            assignmentSpec.Conditions.Add(a => a.Id == assignmentId);
            assignmentSpec.Includes = q => q.Include(a => a.ListQuestions).ThenInclude(q => q.Options)
                                          .Include(a => a.CreatedBy);

            Assignment assignment = await _repository.GetAsync(assignmentSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            // Tìm AssignmentInClass 
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Assignment.Id == assignmentId);
            assignmentInClassSpec.Conditions.Add(aic => aic.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Assignment)
                                                    .Include(aic => aic.Class)
                                                    .Include(aic => aic.Submissions)
                                                        .ThenInclude(s => s.SubmitBy)
                                                    .Include(aic => aic.AssignmentGroups)
                                                        .ThenInclude(ag => ag.GroupMembers)
                                                            .ThenInclude(m => m.Member)
                                                                .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            // Kiểm tra nếu đã nộp bài cho assignment này rồi thì không cho nộp nữa
            bool hasExistingSubmission = assignmentInClass.Submissions.Any(s => s.SubmitBy != null && s.SubmitBy.Id == submitBy.Id);
            if (hasExistingSubmission)
            {
                throw CustomException.WithKey(ExceptionCode.Duplicate, ErrorKeys.AlreadySubmitted);
            }

            // Tạo submission mới
            Submission newSubmission = _mapper.Map<Submission>(submission);
            
            // Lấy Documents từ DB theo DocumentIds
            if (submission.DocumentIds.Any())
            {
                // Query documents qua Class entity vì Document không có Class navigation property
                Specification<Class> classDocSpec = new Specification<Class>();
                classDocSpec.Conditions.Add(c => c.Id == classId);
                classDocSpec.Includes = q => q.Include(c => c.Documents.Where(d => submission.DocumentIds.Contains(d.Id)))
                                              .ThenInclude(d => d.UploadedBy);

                Class classWithDocs = await _repository.GetAsync(classDocSpec)
                    ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);
                
                List<Document> documents = classWithDocs.Documents
                    .Where(d => submission.DocumentIds.Contains(d.Id))
                    .ToList();
                
                // Kiểm tra số lượng documents tìm thấy
                if (documents.Count != submission.DocumentIds.Count)
                {
                    throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.DocumentNotFound);
                }

                // Cập nhật ParentType cho documents
                foreach (Document document in documents)
                {
                    document.ParentType = ParentType.Submission;
                    document.UpdatedAt = DateTime.UtcNow;
                }
                
                newSubmission.SubmittedFiles = documents;
            }
            else
            {
                newSubmission.SubmittedFiles = new List<Document>();
            }
            newSubmission.SubmitBy = submitBy;
            newSubmission.SubmittedTime = DateTime.UtcNow;
            newSubmission.Status = SubmissionStatus.Submitted;

            if (assignment.Type == AssignmentType.Group)
            {
                AssignmentGroup assignmentGroup = assignmentInClass.AssignmentGroups
                    .FirstOrDefault(ag => ag.GroupMembers.Any(m => m.Member.Id == submitBy.Id))
                    ?? throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.GroupNotFoundInAssignment);

                if (assignmentGroup.Status != AssignmentGroupStatus.Approved)
                {
                    throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.GroupNotApproved);
                }

                AssignmentGroupMember memberInGroup = assignmentGroup.GroupMembers
                    .FirstOrDefault(m => m.Member.Id == submitBy.Id)
                    ?? throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.NotGroupMemberInSubmission);

                if (!memberInGroup.IsLeader)
                {
                    throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.OnlyLeaderCanSubmit);
                }
                newSubmission.AssignmentGroup = assignmentGroup;
            }

            // Tính Grade cho Submission nếu là Quiz
            if (assignment.Type == AssignmentType.Quiz && assignment.ListQuestions.Any())
            {
                if (submission.Answers == null || !submission.Answers.Any())
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.QuizNoAnswers);

                if (submission.Answers.Count != assignment.ListQuestions.Count)
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.AnswerCountMismatch);

                // Xóa Answers được map tự động từ AutoMapper để tránh duplicate
                newSubmission.Answers = new List<QuizAnswer>();
                
                var (grade, quizAnswers) = CalculateGrade(submission, assignment);
                newSubmission.Grade = grade;
                newSubmission.Answers = quizAnswers;
                newSubmission.Status = SubmissionStatus.Graded;
                newSubmission.Grade.GradedBy = assignment.CreatedBy;
            }
            else
            {
                if (submission.Answers != null && submission.Answers.Any())
                {
                    throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.OnlyQuizCanHaveAnswers);
                }
                newSubmission.Answers = new List<QuizAnswer>(); // Đảm bảo Answers là empty list cho Essay
                newSubmission.Grade = null; // Chưa chấm điểm cho Essay
            }

            // Thêm submission vào AssignmentInClass
            assignmentInClass.Submissions.Add(newSubmission);

            // Lưu thay đổi - EF sẽ tự động thêm submission mới và cập nhật relationship
            await _repository.SaveChangesAsync();

            // Notify teachers that a submission was created
            List<int> teacherIds = targetClass.Members
                .Where(m => m.User != null && m.RoleInClass == RoleInClass.Teacher)
                .Select(m => m.User.Id)
                .Where(id => id != currentUser.Id)
                .Distinct()
                .ToList();

            if (teacherIds.Count > 0)
            {
                // Determine the correct link based on assignment type
                string linkRedirect = assignment.Type == AssignmentType.Group
                    ? $"/class/{classId}/assignment-groups/{assignmentId}/submissions/{newSubmission.Id}"
                    : $"/class/{classId}/assignments/{assignmentId}/submissions/{newSubmission.Id}";

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "submission_created",
                    Data = new Dictionary<string, string>
                    {
                        { "studentName", currentUser.DisplayName ?? string.Empty },
                        { "assignmentTitle", assignment.Title ?? string.Empty },
                        { "className", targetClass.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = teacherIds,
                    LinkRedirect = linkRedirect,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }

            // Notify group members when a group submission is created (exclude the submitter)
            if (assignment.Type == AssignmentType.Group && newSubmission.AssignmentGroup != null)
            {
                List<int> groupMemberIds = newSubmission.AssignmentGroup.GroupMembers
                    .Where(gm => gm.Member?.User != null)
                    .Select(gm => gm.Member.User.Id)
                    .Where(id => id != currentUser.Id)
                    .Distinct()
                    .ToList();

                if (groupMemberIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "group_submission_created",
                        Data = new Dictionary<string, string>
                        {
                            { "submitterName", currentUser.DisplayName ?? string.Empty },
                            { "groupName", newSubmission.AssignmentGroup.Name ?? string.Empty },
                            { "assignmentTitle", assignment.Title ?? string.Empty },
                            { "className", targetClass.Name ?? string.Empty }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = groupMemberIds,
                        LinkRedirect = $"/class/{classId}/assignment-groups/{assignmentId}",
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }

            if (assignmentInClass.Class == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassOfAssignmentNotFound);
            }

            await _rewardService.GrantOnTimeSubmissionRewardAsync(submitBy, assignmentInClass.Class, newSubmission, assignment.Id, assignment.Deadline);

            if (newSubmission.Grade != null)
            {
                await _rewardService.GrantHighGradeRewardAsync(submitBy, assignmentInClass.Class, newSubmission, assignment);
            }

            return _mapper.Map<CreateSubmissionResponse>(newSubmission);
        }

        private (Grade grade, List<QuizAnswer> answers) CalculateGrade(CreateSubmissionRequest submission, Assignment assignment)
        {
            double totalScore = 0;
            double maxScore = assignment.ListQuestions.Sum(q => q.Point);
            List<QuizAnswer> quizAnswers = new List<QuizAnswer>();

            foreach(CreateQuizAnswerRequest answerRequest in submission.Answers)
            {
                QuizQuestion question = assignment.ListQuestions
                    .FirstOrDefault(q => q.Id == answerRequest.QuizQuestionId)
                    ?? throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.QuestionNotInQuiz);

                QuizAnswer answer = _mapper.Map<QuizAnswer>(answerRequest);

                bool isCorrect = CheckAnswerCorrect(answer, question);
                answer.IsCorrect = isCorrect;

                // Thêm answer vào list để return, KHÔNG thêm vào question.Answers
                quizAnswers.Add(answer);

                if (isCorrect)
                {
                    totalScore += question.Point;
                }
            }

            // Tạo Grade object
            Grade grade = new Grade
            {
                Score = totalScore,
                GradedAt = DateTime.UtcNow,
                Feedback = $"Điểm số: {totalScore}/{maxScore} - Tỷ lệ đúng: {(totalScore / maxScore * 100):F1}%"
            };

            return (grade, quizAnswers);
        }

        private bool CheckAnswerCorrect(QuizAnswer answer, QuizQuestion question)
        {
            // Lấy danh sách ID của các đáp án đúng
            List<int> correctOptionIds = question.Options
                .Where(option => option.IsCorrect)
                .Select(option => option.Id)
                .OrderBy(id => id)
                .ToList();

            // Sắp xếp đáp án đã chọn để so sánh
            List<int> selectedOptionIds = answer.SelectedOptionIds
                .OrderBy(id => id)
                .ToList();

            // So sánh hai danh sách
            return correctOptionIds.SequenceEqual(selectedOptionIds);
        }

        public async Task<List<SubmissionResponse>> GetSubmissionsByAssignmentId(int assignmentId)
        {
            // Lấy tất cả AssignmentInClass có assignmentId này
            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic => aic.Assignment.Id == assignmentId);
            spec.Includes = q => q.Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.SubmitBy)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.Grade)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.SubmittedFiles)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.Answers)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User)
                                  .Include(aic => aic.Assignment)
                                  .Include(aic => aic.Class);

            List<AssignmentInClass> assignmentInClasses = await _repository.GetListAsync(spec);
            
            // Lấy tất cả submissions từ các AssignmentInClass
            List<Submission> submissions = assignmentInClasses
                .SelectMany(aic => aic.Submissions)
                .OrderByDescending(s => s.SubmittedTime)
                .ToList();

            return _mapper.Map<List<SubmissionResponse>>(submissions);
        }

        public async Task<List<SubmissionResponse>> GetSubmissionsByAssignmentAndClass(int assignmentId, int classId)
        {
            // Lấy AssignmentInClass cụ thể
            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic => aic.Assignment.Id == assignmentId);
            spec.Conditions.Add(aic => aic.Class.Id == classId);
            spec.Includes = q => q.Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.SubmitBy)
                                      .ThenInclude(sm => sm.User)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.Grade)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.SubmittedFiles)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.Answers)
                                  .Include(aic => aic.Assignment)
                                  .Include(aic => aic.Submissions)
                                  .ThenInclude(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);  

            return _mapper.Map<List<SubmissionResponse>>(assignmentInClass.Submissions
                .OrderByDescending(s => s.SubmittedTime)
                .ToList());
        }

        public async Task<SubmissionResponse> GetSubmissionById(int submissionId)
        {
            Specification<Submission> spec = new Specification<Submission>();
            spec.Conditions.Add(s => s.Id == submissionId);
            spec.Includes = q => q.Include(s => s.SubmitBy)
                                      .ThenInclude(sm => sm.User)
                                  .Include(s => s.Grade)
                                  .Include(s => s.SubmittedFiles)
                                  .Include(s => s.Answers)
                                  .Include(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);

            Submission submission = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SubmissionNotFound);
        
            return _mapper.Map<SubmissionResponse>(submission);
        }

        public async Task<List<SubmissionResponse>> GetUngradedEssaySubmissions()
        {
            Specification<Submission> spec = new Specification<Submission>();
            spec.Conditions.Add(s => s.Grade == null);
            spec.Includes = q => q.Include(s => s.SubmitBy)
                                      .ThenInclude(sm => sm.User)
                                  .Include(s => s.SubmittedFiles)
                                  .Include(s => s.Answers)
                                  .Include(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);

            List<Submission> submissions = await _repository.GetListAsync(spec);
            return _mapper.Map<List<SubmissionResponse>>(submissions.OrderBy(s => s.SubmittedTime).ToList());
        }

        public async Task<CreateSubmissionResponse> GetSafeSubmissionForStudent(int assignmentId, int classId)
        {

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Lấy AssignmentInClass cụ thể
            Specification<AssignmentInClass> spec = new Specification<AssignmentInClass>();
            spec.Conditions.Add(aic => aic.Assignment.Id == assignmentId && aic.Class.Id == classId);
            spec.Includes = q => q.Include(aic => aic.Submissions)
                                    .ThenInclude(s => s.SubmitBy)
                                        .ThenInclude(cm => cm.User)
                                  .Include(aic => aic.Submissions)
                                    .ThenInclude(s => s.Grade)
                                  .Include(aic => aic.Submissions)
                                    .ThenInclude(s => s.SubmittedFiles)
                                  .Include(aic => aic.Submissions)
                                    .ThenInclude(s => s.Answers)
                                  .Include(aic => aic.Submissions)
                                    .ThenInclude(s => s.AssignmentGroup)
                                  .Include(aic => aic.Assignment)
                                  .Include(aic => aic.AssignmentGroups)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);    
            
            if (assignmentInClass.Assignment.Type == AssignmentType.Group)
            {
                AssignmentGroup assignmentGroup = assignmentInClass.AssignmentGroups
                    .FirstOrDefault(ag => ag.GroupMembers.Any(m => m.Member.User.Id == currentUser.Id))
                    ?? throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.GroupNotFoundInAssignment);
                
                Submission groupSubmission = assignmentInClass.Submissions
                    .FirstOrDefault(s => s.AssignmentGroup != null && s.AssignmentGroup.Id == assignmentGroup.Id)
                    ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.GroupSubmissionNotFound);
                return _mapper.Map<CreateSubmissionResponse>(groupSubmission);
            }

            Submission submission = assignmentInClass.Submissions.FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SubmissionNotFound);

            return _mapper.Map<CreateSubmissionResponse>(submission);
        }

        public async Task<SubmissionResponse> UpdateSubmission(UpdateSubmissionRequest submission, int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Kiểm tra deadline assignment trước
            Specification<Assignment> assignmentSpec = new Specification<Assignment>();
            assignmentSpec.Conditions.Add(a => a.Id == assignmentId);
            assignmentSpec.Includes = q => q.Include(a => a.ListQuestions).ThenInclude(q => q.Options)
                                          .Include(a => a.CreatedBy);
            Assignment assignment = await _repository.GetAsync(assignmentSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            DateTime now = DateTime.UtcNow;
            if (now > assignment.Deadline)
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.DeadlinePassed);
            }

            Specification<Submission> spec = new Specification<Submission>();
            spec.Conditions.Add(s => s.Id == submission.Id);
            spec.Includes = q => q.Include(s => s.SubmitBy)
                                      .ThenInclude(sm => sm.User)
                                  .Include(s => s.SubmittedFiles)
                                  .Include(s => s.Grade)
                                  .Include(s => s.Answers)
                                  .Include(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);
            
            Submission existingSubmission = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SubmissionNotFound);
            
            if ((existingSubmission.SubmitBy.User.Id != currentUser.Id && 
                existingSubmission.AssignmentGroup == null) || (existingSubmission.AssignmentGroup != null &&
                 !existingSubmission.AssignmentGroup.GroupMembers.Any(m => m.Member.User.Id == currentUser.Id && m.IsLeader)))
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.NoPermissionToEditSubmission);
            }

            if (existingSubmission.Status == SubmissionStatus.Graded)
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.SubmissionGradedCannotEdit);
            }

            existingSubmission.Content = submission.Content;
            existingSubmission.SubmittedTime = DateTime.UtcNow;

            // Xử lý cập nhật tài liệu
            if (submission.DocumentIds.Any())
            {
                // Query documents qua Class entity vì Document không có Class navigation property
                Specification<Class> classDocSpec = new Specification<Class>();
                classDocSpec.Conditions.Add(c => c.Id == classId);
                classDocSpec.Includes = q => q.Include(c => c.Documents.Where(d => submission.DocumentIds.Contains(d.Id)))
                                              .ThenInclude(d => d.UploadedBy);

                Class classWithDocs = await _repository.GetAsync(classDocSpec)
                    ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);
                
                List<Document> documents = classWithDocs.Documents
                    .Where(d => submission.DocumentIds.Contains(d.Id))
                    .ToList();
                
                // Kiểm tra số lượng documents tìm thấy
                if (documents.Count != submission.DocumentIds.Count)
                {
                    throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SomeDocumentsNotFound);
                }

                // Cập nhật ParentType cho documents
                foreach (Document document in documents)
                {
                    document.ParentType = ParentType.Submission;
                    document.UpdatedAt = DateTime.UtcNow;
                }
                
                existingSubmission.SubmittedFiles = documents;
            }
            else
            {
                existingSubmission.SubmittedFiles = new List<Document>();
            }

            await _repository.SaveChangesAsync();
            return _mapper.Map<SubmissionResponse>(existingSubmission);
        }

        public async Task<bool> CancelSubmission(int submissionId, int assignmentId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Kiểm tra deadline assignment
            Specification<Assignment> assignmentSpec = new Specification<Assignment>();
            assignmentSpec.Conditions.Add(a => a.Id == assignmentId);
            Assignment assignment = await _repository.GetAsync(assignmentSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentNotFound);

            DateTime now = DateTime.UtcNow;
            if (now > assignment.Deadline)
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.DeadlinePassed);
            }

            // Lấy submission
            Specification<Submission> spec = new Specification<Submission>();
            spec.Conditions.Add(s => s.Id == submissionId);
            spec.Includes = q => q.Include(s => s.SubmitBy)
                                      .ThenInclude(sm => sm.User)
                                  .Include(s => s.Grade)
                                  .Include(s => s.SubmittedFiles)
                                  .Include(s => s.Answers)
                                  .Include(s => s.AssignmentGroup!)
                                    .ThenInclude(ag => ag.GroupMembers)
                                        .ThenInclude(m => m.Member)
                                            .ThenInclude(cm => cm.User);

            Submission submission = await _repository.GetAsync(spec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SubmissionNotFound);

            // Kiểm tra quyền sở hữu
            if ((submission.SubmitBy.User.Id != currentUser.Id && 
                submission.AssignmentGroup == null) || (submission.AssignmentGroup != null &&
                 !submission.AssignmentGroup.GroupMembers.Any(m => m.Member.User.Id == currentUser.Id && m.IsLeader)))
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.NoPermissionToCancelSubmission);
            }

            // Kiểm tra trạng thái
            if (submission.Status == SubmissionStatus.Graded)
            {
                throw CustomException.WithKey(ExceptionCode.NotAllowUpdate, ErrorKeys.SubmissionGradedCannotCancel);
            }

            // Xóa submission
            _repository.Remove(submission);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}