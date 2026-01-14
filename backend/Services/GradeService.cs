using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Grades;
using OnlineClassroomManagement.Models.Responses.Grades;
using OnlineClassroomManagement.Models.Responses.Submissions;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IGradeService
    {
        Task<SubmissionResponse> GradeSubmission(CreateGradeRequest request, int submissionId);
        Task<ClassGradeOverviewResponse> GetClassGradeOverview(int classId);
        Task<List<StudentAverageResponse>> GetStudentAveragesInClass(int classId);
        Task<PaginatedList<AssignmentGradeSummaryResponse>> GetAssignmentGradeSummaries(int classId, GetPaginatedAssignmentGradeRequest request);
        Task<AssignmentGradeDetailResponse> GetAssignmentGradeDetails(int classId, int assignmentId);
        Task<StudentGradesSummaryResponse> GetMyGrades(int classId);
        Task<GradingStatistics> GetGradingStatistics(int assignmentId);
    }

    public class GradeService : IGradeService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ISubmissionService _submissionService;
        private readonly IMapper _mapper;
        private readonly IRewardService _rewardService;
        private readonly INotificationService _notificationService;

        public GradeService(IRepository repository, ICurrentUserService currentUserService, ISubmissionService submissionService, IMapper mapper, IRewardService rewardService, INotificationService notificationService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _submissionService = submissionService;
            _mapper = mapper;
            _rewardService = rewardService;
            _notificationService = notificationService;
        }

        public async Task<SubmissionResponse> GradeSubmission(CreateGradeRequest request, int submissionId)    
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);   

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Submissions.Any(s => s.Id == submissionId));
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Assignment)
                                                    .Include(aic => aic.Class)
                                                    .Include(aic => aic.Submissions)
                                                        .ThenInclude(s => s.SubmitBy)
                                                            .ThenInclude(cm => cm.User)
                                                    .Include(aic => aic.Submissions)
                                                        .ThenInclude(s => s.SubmittedFiles)
                                                    .Include(aic => aic.Submissions)
                                                        .ThenInclude(s => s.Grade)
                                                    .Include(aic => aic.Submissions)
                                                        .ThenInclude(s => s.AssignmentGroup!)
                                                            .ThenInclude(ag => ag.GroupMembers)
                                                                .ThenInclude(gm => gm.Member)
                                                                    .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound); 
            
            // Validate điểm số
            if (request.Score < 0 || request.Score > assignmentInClass.Assignment.MaxScore)
            {
                throw CustomException.WithKey(ExceptionCode.Invalidate, ErrorKeys.GradeScoreInvalid);
            }

            // Tìm submission cần chấm điểm
            Submission submission = assignmentInClass.Submissions
                .FirstOrDefault(s => s.Id == submissionId)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.SubmissionNotFound);

            Specification<ClassMember> memberSpec = new Specification<ClassMember>();
            memberSpec.Conditions.Add(cm => cm.User.Id == currentUser.Id);
            ClassMember gradedBy = await _repository.GetAsync<ClassMember>(memberSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.GraderMemberNotFound);

            // Kiểm tra xem bài nộp đã được chấm điểm chưa
            if (submission.Grade != null)
            {
                // Cập nhật điểm số đã có
                _mapper.Map(request, submission.Grade);
                submission.Grade.GradedAt = DateTime.UtcNow;
                submission.Grade.GradedBy = gradedBy;
            }
            else
            {
                // Tạo điểm số mới
                Grade grade = _mapper.Map<Grade>(request);
                grade.GradedAt = DateTime.UtcNow;
                grade.GradedBy = gradedBy;
                submission.Grade = grade;
            }

            // Cập nhật trạng thái submission
            if (submission.Status == SubmissionStatus.Submitted)
            {
                submission.Status = SubmissionStatus.Graded;
            }

            await _repository.SaveChangesAsync();

            // Notify students that the submission has been graded
            List<int> receiverIds;
            if (assignmentInClass.Assignment.Type == AssignmentType.Group && submission.AssignmentGroup != null)
            {
                receiverIds = submission.AssignmentGroup.GroupMembers
                    .Where(gm => gm.Member?.User != null)
                    .Select(gm => gm.Member.User.Id)
                    .Distinct()
                    .ToList();
            }
            else
            {
                receiverIds = submission.SubmitBy?.User != null
                    ? new List<int> { submission.SubmitBy.User.Id }
                    : new List<int>();
            }

            receiverIds = receiverIds.Where(id => id != currentUser.Id).Distinct().ToList();
            if (receiverIds.Count > 0)
            {
                string assignmentTitle = assignmentInClass.Assignment?.Title ?? string.Empty;
                string className = assignmentInClass.Class?.Name ?? string.Empty;
                string scoreText = submission.Grade?.Score.ToString() ?? string.Empty;
                int? assignmentId = assignmentInClass.Assignment?.Id;

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "grade_submission_graded",
                    Data = new Dictionary<string, string>
                    {
                        { "assignmentTitle", assignmentTitle },
                        { "className", className },
                        { "score", scoreText }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = receiverIds,
                    LinkRedirect = $"/class/{assignmentInClass.Class?.Id}/grades?highlightAssignment={assignmentId}",
                    OpenNewTab = false,
                    NeedSendEmail = true,
                    MailTitle = $"[OCM] Kết quả bài tập: {assignmentTitle}",
                    MailHtmlContent = $"<p>Bài tập <b>{assignmentTitle}</b> (lớp <b>{className}</b>) đã được chấm: <b>{scoreText}</b> điểm.</p>"
                });
            }

            // Xử lý reward: Nếu là Group assignment, grant cho tất cả members
            if (assignmentInClass.Assignment.Type == AssignmentType.Group && submission.AssignmentGroup != null)
            {
                if (assignmentInClass.Class != null && assignmentInClass.Assignment != null)
                {
                    // Grant reward cho tất cả group members
                    foreach (AssignmentGroupMember groupMember in submission.AssignmentGroup.GroupMembers)
                    {
                        await _rewardService.GrantHighGradeRewardAsync(
                            groupMember.Member,
                            assignmentInClass.Class,
                            submission,
                            assignmentInClass.Assignment);
                    }
                }
            }
            else
            {
                // Individual assignment: chỉ grant cho người nộp
                if (assignmentInClass.Class != null && assignmentInClass.Assignment != null && submission.SubmitBy != null)
                {
                    await _rewardService.GrantHighGradeRewardAsync(
                        submission.SubmitBy,
                        assignmentInClass.Class,
                        submission,
                        assignmentInClass.Assignment);
                }
            }

            return _mapper.Map<SubmissionResponse>(submission);
        }

        public async Task<ClassGradeOverviewResponse> GetClassGradeOverview(int classId)
        {
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            // Lấy danh sách sinh viên có role Student trong lớp
            List<ClassMember> students = targetClass.Members.Where(m => m.RoleInClass == RoleInClass.Student).ToList();

            // Lấy danh sách assignments trong lớp
            List<AssignmentInClass> assignments = await _repository.GetListAsync<AssignmentInClass>(
                aic => aic.Class.Id == classId,
                includes: q => q
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.Grade)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.SubmitBy)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.AssignmentGroup)
                    .Include(aic => aic.Assignment));

            int totalStudents = students.Count;
            int totalAssignments = assignments.Count;

            // Nếu không có assignments hoặc students, trả về dữ liệu mặc định
            if (totalAssignments == 0 || totalStudents == 0)
            {
                return new ClassGradeOverviewResponse
                {
                    ClassId = classId,
                    ClassName = targetClass.Name,
                    TotalStudents = totalStudents,
                    TotalAssignments = totalAssignments,
                    AverageClassScore = 0,
                    AverageClassPercentage = 0,
                    HighestScore = 0,
                    LowestScore = 0,
                    GradingProgress = 0
                };
            }

            // Tính toán thống kê điểm số - CHỈ tính submissions của STUDENTS
            List<double> allNormalizedScores = new List<double>();
            int totalSubmissions = 0;
            int gradedSubmissions = 0;

            // Tạo HashSet chứa IDs của students để check nhanh
            HashSet<int> studentMemberIds = students.Select(s => s.Id).ToHashSet();

            foreach (AssignmentInClass assignment in assignments)
            {
                // Đối với Group Assignment, chỉ tính một lần cho mỗi group (không tính trùng cho từng member)
                if (assignment.Assignment != null && assignment.Assignment.Type == AssignmentType.Group)
                {
                    // Lấy danh sách unique groups (dựa trên AssignmentGroup.Id)
                    var groupedSubmissions = assignment.Submissions
                        .Where(s => s.SubmitBy != null && studentMemberIds.Contains(s.SubmitBy.Id) && s.AssignmentGroup != null)
                        .GroupBy(s => s.AssignmentGroup!.Id)
                        .Select(g => g.First()) // Chỉ lấy 1 submission đại diện cho mỗi group
                        .ToList();

                    foreach (Submission submission in groupedSubmissions)
                    {
                        totalSubmissions++;

                        if (submission.Grade != null)
                        {
                            gradedSubmissions++;

                            if (assignment.Assignment.MaxScore > 0)
                            {
                                // Quy đổi điểm về thang 10
                                double normalizedScore = Math.Round((submission.Grade.Score / assignment.Assignment.MaxScore) * 10, 2);
                                allNormalizedScores.Add(normalizedScore);
                            }
                        }
                    }
                }
                else
                {
                    // Đối với Individual/Essay/Quiz Assignment, tính bình thường
                    foreach (Submission submission in assignment.Submissions)
                    {
                        // CHỈ tính submissions của students, BỎ QUA teacher
                        if (submission.SubmitBy == null || !studentMemberIds.Contains(submission.SubmitBy.Id))
                            continue;

                        totalSubmissions++;

                        if (submission.Grade != null)
                        {
                            gradedSubmissions++;

                            if (assignment.Assignment != null && assignment.Assignment.MaxScore > 0)
                            {
                                // Quy đổi điểm về thang 10
                                double normalizedScore = Math.Round((submission.Grade.Score / assignment.Assignment.MaxScore) * 10, 2);
                                allNormalizedScores.Add(normalizedScore);
                            }
                        }
                    }
                }
            }

            double averageClassScore = 0;
            double highestScore = 0;
            double lowestScore = 0;

            if (allNormalizedScores.Any())
            {
                averageClassScore = Math.Round(allNormalizedScores.Average(), 2);
                highestScore = Math.Round(allNormalizedScores.Max(), 2);
                lowestScore = Math.Round(allNormalizedScores.Min(), 2);
            }

            double gradingProgress = totalSubmissions > 0
                ? (double)gradedSubmissions / totalSubmissions * 100
                : 0;

            return new ClassGradeOverviewResponse
            {
                ClassId = classId,
                ClassName = targetClass.Name,
                TotalStudents = totalStudents,
                TotalAssignments = totalAssignments,
                AverageClassScore = Math.Round(averageClassScore, 2),
                AverageClassPercentage = Math.Round((averageClassScore / 10) * 100, 2),
                HighestScore = Math.Round(highestScore, 2),
                LowestScore = Math.Round(lowestScore, 2),
                GradingProgress = Math.Round(gradingProgress, 2)
            };
        }

        public async Task<List<StudentAverageResponse>> GetStudentAveragesInClass(int classId)
        {
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            // Lấy danh sách sinh viên có role Student trong lớp
            List<ClassMember> students = targetClass.Members.Where(m => m.RoleInClass == RoleInClass.Student).ToList();

            // Lấy danh sách assignments trong lớp
            List<AssignmentInClass> assignments = await _repository.GetListAsync<AssignmentInClass>(
                aic => aic.Class.Id == classId,
                includes: q => q
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.Grade)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.SubmitBy)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.AssignmentGroup!)
                            .ThenInclude(ag => ag.GroupMembers)
                                .ThenInclude(gm => gm.Member)
                    .Include(aic => aic.Assignment));

            // Tổng số assignments trong lớp
            int totalAssignments = assignments.Count;

            // Tính điểm trung bình cho từng học sinh
            List<StudentAverageResponse> studentAverages = new List<StudentAverageResponse>();

            foreach (ClassMember student in students)
            {
                // Lấy điểm đã quy đổi về thang 10
                List<double> normalizedScores = new List<double>();
                int submittedCount = 0;
                int gradedCount = 0;

                foreach (AssignmentInClass aic in assignments)
                {
                    if (aic.Assignment == null) continue;

                    Submission? relevantSubmission = null;

                    if (aic.Assignment.Type == AssignmentType.Group)
                    {
                        // Với Group assignment: Tìm submission của group mà student là thành viên
                        relevantSubmission = aic.Submissions
                            .FirstOrDefault(s => s.AssignmentGroup != null && 
                                                s.AssignmentGroup.GroupMembers.Any(gm => gm.Member.Id == student.Id));
                        
                        // Nếu không tìm thấy submission với group, fallback về submission theo SubmitBy
                        if (relevantSubmission == null)
                        {
                            relevantSubmission = aic.Submissions.FirstOrDefault(s => s.SubmitBy.Id == student.Id);
                        }
                    }
                    else
                    {
                        // Với Individual assignment: Tìm submission của chính student
                        relevantSubmission = aic.Submissions.FirstOrDefault(s => s.SubmitBy.Id == student.Id);
                    }

                    if (relevantSubmission != null)
                    {
                        submittedCount++;

                        if (relevantSubmission.Grade != null)
                        {
                            gradedCount++;

                            if (aic.Assignment.MaxScore > 0)
                            {
                                // Quy đổi điểm về thang 10: (Score / MaxScore) * 10
                                double normalizedScore = Math.Round((relevantSubmission.Grade.Score / aic.Assignment.MaxScore) * 10, 2);
                                normalizedScores.Add(normalizedScore);
                            }
                        }
                    }
                }

                // Tính điểm trung bình từ các điểm đã quy đổi
                double averageScore = normalizedScores.Any() ? Math.Round(normalizedScores.Average(), 2) : 0;

                studentAverages.Add(new StudentAverageResponse
                {
                    StudentId = student.User?.Id ?? 0,
                    StudentName = student.User?.DisplayName ?? "Unknown",
                    StudentAvatarUrl = student.User?.AvatarUrl,
                    AverageScore = Math.Round(averageScore, 2), // Làm tròn 2 chữ số thập phân
                    TotalAssignments = totalAssignments,
                    SubmittedCount = submittedCount,
                    GradedCount = gradedCount
                });
            }

            // Sắp xếp theo điểm trung bình giảm dần
            return studentAverages.OrderByDescending(s => s.AverageScore).ToList();
        }

        public async Task<PaginatedList<AssignmentGradeSummaryResponse>> GetAssignmentGradeSummaries(int classId, GetPaginatedAssignmentGradeRequest request)
        {
            // 1️⃣ Kiểm tra lớp có tồn tại
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            // Đếm tổng số học sinh trong lớp
            int totalStudents = targetClass.Members.Count(m => m.RoleInClass == RoleInClass.Student);

            // 2️⃣ Tạo PaginationSpecification cho AssignmentInClass
            PaginationSpecification<AssignmentInClass> paginationSpec = new PaginationSpecification<AssignmentInClass>();
            paginationSpec.Conditions.Add(aic => aic.Class.Id == classId);
            
            // Add search filter if SearchTerm is provided
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                string searchLower = request.SearchTerm.ToLower();
                paginationSpec.Conditions.Add(aic => 
                    aic.Assignment.Title.ToLower().Contains(searchLower));
            }
            
            paginationSpec.Includes = q => q
                .Include(aic => aic.Assignment)
                .Include(aic => aic.Submissions)
                    .ThenInclude(s => s.Grade)
                .Include(aic => aic.Submissions)
                    .ThenInclude(s => s.SubmitBy)
                .Include(aic => aic.Submissions)
                    .ThenInclude(s => s.AssignmentGroup);

            paginationSpec.PageIndex = request.PageNumber;
            paginationSpec.PageSize = request.PageSize;

            // 3️⃣ Lấy danh sách AssignmentInClass có phân trang
            PaginatedList<AssignmentInClass> pagedAssignments = await _repository.GetListAsync(paginationSpec);

            // 4️⃣ Map từng AssignmentInClass -> AssignmentGradeSummaryResponse
            List<AssignmentGradeSummaryResponse> summaries = pagedAssignments.Items
                .Select(aic =>
                {
                    Assignment assignment = aic.Assignment!;
                    
                    // CHỈ lấy submissions của STUDENTS (lọc theo SubmitBy)
                    List<Submission> allSubmissionsInClass = aic.Submissions.ToList();
                    
                    // Lấy danh sách student IDs từ class
                    List<int> studentMemberIds = targetClass.Members
                        .Where(m => m.RoleInClass == RoleInClass.Student)
                        .Select(m => m.Id)
                        .ToList();
                    
                    // Filter submissions: CHỈ lấy của students
                    List<Submission> submissions = allSubmissionsInClass
                        .Where(s => s.SubmitBy != null && studentMemberIds.Contains(s.SubmitBy.Id))
                        .ToList();

                    int submittedCount;
                    int gradedCount;
                    List<Submission> gradedSubmissions;

                    // Xử lý khác nhau cho Group assignment
                    if (assignment.Type == AssignmentType.Group)
                    {
                        // Đối với Group assignment:
                        // 1. Submissions có AssignmentGroup: đếm unique groups
                        // 2. Submissions không có AssignmentGroup (học viên không nộp + không thuộc group): đếm từng submission
                        
                        var submissionsWithGroup = submissions
                            .Where(s => s.AssignmentGroup != null)
                            .GroupBy(s => s.AssignmentGroup!.Id)
                            .Select(g => g.First())
                            .ToList();

                        var submissionsWithoutGroup = submissions
                            .Where(s => s.AssignmentGroup == null)
                            .ToList();

                        // Tổng submissions = unique groups + submissions không thuộc group nào
                        var allProcessedSubmissions = submissionsWithGroup.Concat(submissionsWithoutGroup).ToList();

                        submittedCount = allProcessedSubmissions.Count;
                        gradedSubmissions = allProcessedSubmissions.Where(s => s.Grade != null).ToList();
                        gradedCount = gradedSubmissions.Count;
                    }
                    else
                    {
                        // Đối với Individual assignment: đếm bình thường
                        submittedCount = submissions.Count;
                        gradedSubmissions = submissions.Where(s => s.Grade != null).ToList();
                        gradedCount = gradedSubmissions.Count;
                    }

                    decimal averageScore = 0;
                    decimal averagePercentage = 0;
                    decimal highestScore = 0;
                    decimal lowestScore = 0;
                    
                    // Tính progress dựa trên tổng số học sinh (hoặc số groups cho Group assignment)
                    decimal gradingProgress = assignment.Type == AssignmentType.Group
                        ? (submittedCount > 0 ? Math.Round((decimal)gradedCount / submittedCount * 100, 2) : 0)
                        : (totalStudents > 0 ? Math.Round((decimal)gradedCount / totalStudents * 100, 2) : 0);

                    if (gradedSubmissions.Any() && assignment.MaxScore > 0)
                    {
                        decimal maxScoreDecimal = (decimal)assignment.MaxScore;
                        
                        // Quy đổi tất cả điểm về thang 10 trước khi tính toán
                        List<decimal> normalizedScores = gradedSubmissions
                            .Select(s => Math.Round((decimal)(s.Grade!.Score / assignment.MaxScore) * 10, 2))
                            .ToList();

                        // Tính điểm trung bình, cao nhất, thấp nhất từ điểm đã quy đổi
                        averageScore = Math.Round(normalizedScores.Average(), 2);
                        highestScore = normalizedScores.Max();
                        lowestScore = normalizedScores.Min();
                        
                        // Tính phần trăm từ điểm trung bình (điểm đã quy đổi về thang 10)
                        averagePercentage = Math.Round((averageScore / 10) * 100, 2);
                    }

                    return new AssignmentGradeSummaryResponse
                    {
                        AssignmentId = assignment.Id,
                        AssignmentTitle = assignment.Title,
                        AssignmentType = assignment.Type.ToString(),
                        MaxScore = (decimal)assignment.MaxScore,
                        DueDate = assignment.Deadline,
                        TotalSubmissions = assignment.Type == AssignmentType.Group ? submittedCount : totalStudents,
                        GradedSubmissions = gradedCount,
                        PendingSubmissions = assignment.Type == AssignmentType.Group 
                            ? (submittedCount - gradedCount) 
                            : (totalStudents - gradedCount),
                        AverageScore = averageScore,
                        AveragePercentage = averagePercentage,
                        HighestScore = highestScore,
                        LowestScore = lowestScore,
                        GradingProgress = gradingProgress
                    };
                })
                .OrderByDescending(s => s.DueDate ?? DateTime.MinValue)
                .ToList();

            // 5️⃣ Trả về danh sách có phân trang
            return new PaginatedList<AssignmentGradeSummaryResponse>(
                summaries,
                pagedAssignments.TotalItems,
                request.PageNumber,
                request.PageSize
            );
        }

        public async Task<AssignmentGradeDetailResponse> GetAssignmentGradeDetails(int classId, int assignmentId)
        {
            // Kiểm tra class có tồn tại không
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            // Lấy assignment trong class
            AssignmentInClass? assignmentInClass = await _repository.GetAsync<AssignmentInClass>(
                aic => aic.Class.Id == classId && aic.Assignment.Id == assignmentId,
                includes: q => q
                    .Include(aic => aic.Assignment)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.Grade)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.SubmitBy)
                            .ThenInclude(cm => cm.User)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.AssignmentGroup!)
                            .ThenInclude(ag => ag.GroupMembers)
                                .ThenInclude(gm => gm.Member)
                                    .ThenInclude(m => m.User));

            if (assignmentInClass?.Assignment == null)
            {
                throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);
            }

            Assignment assignment = assignmentInClass.Assignment;

            // Lấy danh sách học sinh trong lớp
            List<ClassMember> students = targetClass.Members
                .Where(m => m.RoleInClass == RoleInClass.Student)
                .ToList();

            List<StudentGradeResponse> studentGrades = new List<StudentGradeResponse>();

            foreach (ClassMember student in students)
            {
                Submission? submission = null;

                if (assignment.Type == AssignmentType.Group)
                {
                    // Với Group assignment: Tìm submission của group mà student là thành viên
                    submission = assignmentInClass.Submissions
                        .FirstOrDefault(s => s.AssignmentGroup != null && 
                                            s.AssignmentGroup.GroupMembers.Any(gm => gm.Member.Id == student.Id));
                    
                    // Nếu không tìm thấy submission với group, fallback về submission theo SubmitBy
                    if (submission == null)
                    {
                        submission = assignmentInClass.Submissions
                            .FirstOrDefault(s => s.SubmitBy.Id == student.Id);
                    }
                }
                else
                {
                    // Với Individual assignment: Tìm submission của chính student
                    submission = assignmentInClass.Submissions
                        .FirstOrDefault(s => s.SubmitBy.Id == student.Id);
                }

                string status = "not_submitted";
                decimal? score = null;
                decimal? normalizedScore = null;
                decimal? percentage = null;
                string? feedback = null;

                if (submission != null)
                {
                    if (submission.Grade != null)
                    {
                        status = "graded";
                        score = (decimal)submission.Grade.Score;
                        feedback = submission.Grade.Feedback;

                        // Chuẩn hóa điểm về thang 10
                        if (assignment.MaxScore > 0)
                        {
                            decimal maxScoreDecimal = (decimal)assignment.MaxScore;
                            normalizedScore = Math.Round((score.Value / maxScoreDecimal) * 10, 2);
                            percentage = Math.Round((score.Value / maxScoreDecimal) * 100, 2);
                        }
                    }
                    else
                    {
                        status = "pending";
                    }
                }

                studentGrades.Add(new StudentGradeResponse
                {
                    StudentId = student.User?.Id ?? 0,
                    StudentName = student.User?.DisplayName ?? "Unknown",
                    SubmissionId = submission?.Id,
                    SubmittedAt = submission?.SubmittedTime,
                    Score = score,
                    NormalizedScore = normalizedScore,
                    Percentage = percentage,
                    Status = status,
                    Feedback = feedback
                });
            }

            return new AssignmentGradeDetailResponse
            {
                AssignmentId = assignment.Id,
                AssignmentTitle = assignment.Title,
                AssignmentType = assignment.Type.ToString(),
                MaxScore = (decimal)assignment.MaxScore,
                DueDate = assignment.Deadline,
                StudentGrades = studentGrades.OrderBy(sg => sg.StudentName).ToList()
            };
        }

        public async Task<StudentGradesSummaryResponse> GetMyGrades(int classId)
        {
            // Get current user
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Get class information
            Specification<Class> classSpec = new Specification<Class>();
            classSpec.Conditions.Add(c => c.Id == classId);
            classSpec.Includes = q => q.Include(c => c.Members).ThenInclude(m => m.User);

            Class targetClass = await _repository.GetAsync(classSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ClassNotFound);

            // Check if user is a student in this class
            ClassMember? classMember = targetClass.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id && m.RoleInClass == RoleInClass.Student);

            if (classMember == null)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotStudentInClass);
            }

            // Get all assignments in this class
            List<AssignmentInClass> assignments = await _repository.GetListAsync<AssignmentInClass>(
                aic => aic.Class.Id == classId,
                includes: q => q
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.Grade)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.SubmitBy)
                    .Include(aic => aic.Submissions)
                        .ThenInclude(s => s.AssignmentGroup!)
                            .ThenInclude(ag => ag.GroupMembers)
                                .ThenInclude(gm => gm.Member)
                                    .ThenInclude(m => m.User)
                    .Include(aic => aic.Assignment));

            List<StudentAssignmentGradeResponse> assignmentGrades = new();
            List<decimal> gradedScores = new();

            foreach (AssignmentInClass assignmentInClass in assignments)
            {
                Assignment assignment = assignmentInClass.Assignment;

                Submission? submission = null;

                if (assignment.Type == AssignmentType.Group)
                {
                    // Với Group assignment: Tìm submission của group mà student là thành viên
                    submission = assignmentInClass.Submissions
                        .FirstOrDefault(s => s.AssignmentGroup != null && 
                                            s.AssignmentGroup.GroupMembers.Any(gm => gm.Member.User.Id == currentUser.Id));
                    
                    // Nếu không tìm thấy submission với group, fallback về submission theo SubmitBy
                    if (submission == null)
                    {
                        submission = assignmentInClass.Submissions
                            .FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id);
                    }
                }
                else
                {
                    // Với Individual assignment: Tìm submission của chính student
                    submission = assignmentInClass.Submissions
                        .FirstOrDefault(s => s.SubmitBy.User.Id == currentUser.Id);
                }

                decimal? score = null;
                decimal? normalizedScore = null;
                decimal? percentage = null;
                string status = "not_submitted";
                string? feedback = null;

                if (submission != null)
                {
                    if (submission.Grade != null)
                    {
                        score = Math.Round((decimal)submission.Grade.Score, 2);
                        decimal maxScore = (decimal)assignment.MaxScore;
                        normalizedScore = Math.Round((score.Value / maxScore) * 10, 2);
                        percentage = Math.Round((score.Value / maxScore) * 100, 2);
                        feedback = submission.Grade.Feedback;
                        status = "graded";

                        gradedScores.Add(normalizedScore.Value);
                    }
                    else
                    {
                        status = "pending";
                    }
                }

                assignmentGrades.Add(new StudentAssignmentGradeResponse
                {
                    AssignmentId = assignment.Id,
                    AssignmentTitle = assignment.Title,
                    AssignmentType = assignment.Type.ToString(),
                    MaxScore = (decimal)assignment.MaxScore,
                    DueDate = assignment.Deadline,
                    SubmissionId = submission?.Id,
                    SubmittedAt = submission?.SubmittedTime,
                    Score = score,
                    NormalizedScore = normalizedScore,
                    Percentage = percentage,
                    Status = status,
                    Feedback = feedback
                });
            }

            // Calculate statistics
            int totalAssignments = assignments.Count;
            int gradedCount = assignmentGrades.Count(ag => ag.Status == "graded");
            int pendingCount = assignmentGrades.Count(ag => ag.Status == "pending");
            int notSubmittedCount = assignmentGrades.Count(ag => ag.Status == "not_submitted");

            decimal averageScore = gradedScores.Any() ? Math.Round(gradedScores.Average(), 2) : 0;
            decimal averagePercentage = gradedScores.Any() ? Math.Round((averageScore / 10) * 100, 2) : 0;

            return new StudentGradesSummaryResponse
            {
                StudentId = currentUser.Id,
                StudentName = currentUser.DisplayName,
                ClassId = classId,
                ClassName = targetClass.Name,
                AverageScore = averageScore,
                AveragePercentage = averagePercentage,
                TotalAssignments = totalAssignments,
                GradedCount = gradedCount,
                PendingCount = pendingCount,
                NotSubmittedCount = notSubmittedCount,
                Assignments = assignmentGrades.OrderBy(ag => ag.DueDate).ToList()
            };
        }

        //Thống kê tổng bài nộp, đã chấm, chưa chấm, điểm trung bình, cao nhất, thấp nhất
        public async Task<GradingStatistics> GetGradingStatistics(int assignmentId)
        {
            List<SubmissionResponse> allSubmissions = await _submissionService.GetSubmissionsByAssignmentId(assignmentId);

            // Kiểm tra xem có phải Group assignment không
            SubmissionResponse? firstSubmission = allSubmissions.FirstOrDefault();
            bool isGroupAssignment = firstSubmission?.AssignmentGroup != null;

            List<SubmissionResponse> processedSubmissions;
            
            if (isGroupAssignment)
            {
                // Đối với Group assignment: chỉ đếm unique groups (tránh đếm trùng)
                processedSubmissions = allSubmissions
                    .Where(s => s.AssignmentGroup != null)
                    .GroupBy(s => s.AssignmentGroup!.Id)
                    .Select(g => g.First())
                    .ToList();
            }
            else
            {
                // Đối với Individual assignment: đếm bình thường
                processedSubmissions = allSubmissions;
            }

            List<SubmissionResponse> gradedSubmissions = processedSubmissions.Where(s => s.Grade != null).ToList();
            List<SubmissionResponse> ungradedSubmissions = processedSubmissions.Where(s => s.Grade == null).ToList();

            GradingStatistics statistics = new GradingStatistics
            {
                TotalSubmissions = processedSubmissions.Count,
                GradedSubmissions = gradedSubmissions.Count,
                UngradedSubmissions = ungradedSubmissions.Count
            };

            if (gradedSubmissions.Any())
            {
                List<double> scores = gradedSubmissions.Select(s => s.Grade!.Score).ToList();
                statistics.AverageScore = Math.Round(scores.Average(), 2);
                statistics.HighestScore = Math.Round(scores.Max(), 2);
                statistics.LowestScore = Math.Round(scores.Min(), 2);
            }

            return statistics;
        }

    }
}