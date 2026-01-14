using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection; // Cần thêm cái này
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services.Background
{
    public class AssignmentDeadlineProcessorService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AssignmentDeadlineProcessorService> _logger;
        private readonly TimeSpan _interval;

        public AssignmentDeadlineProcessorService(
            IServiceScopeFactory scopeFactory,
            ILogger<AssignmentDeadlineProcessorService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _interval = TimeSpan.FromSeconds(240); // Tăng lên 300s/lần để giảm tải DB nếu không cần gấp
        }
    
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Assignment Status Update Background Service is starting");

            await SafeRunOnce(stoppingToken);

            using PeriodicTimer timer = new(_interval);
            while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
            {
                await SafeRunOnce(stoppingToken);
            }

            _logger.LogInformation("Assignment Status Update Background Service is stopping");
        }

        private async Task SafeRunOnce(CancellationToken ct)
        {
            try
            {
                // Tạo scope ở đây để đảm bảo resource được giải phóng sạch sẽ sau mỗi lần chạy full quy trình
                using var scope = _scopeFactory.CreateScope();
                var repository = scope.ServiceProvider.GetRequiredService<IRepository>();
                // Để tránh DbContext bị phình to (bloated) khi xử lý nhiều record, 
                // ta sẽ truyền scope vào để có thể control ChangeTracker nếu cần, 
                // hoặc đơn giản là dùng repository của scope này.
                await ProcessExpiredAssignmentsAsync(repository, ct);
            }
            catch (OperationCanceledException)
            {
                // Bỏ qua khi shutdown
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái bài tập");
            }
        }

        private async Task ProcessExpiredAssignmentsAsync(IRepository repository, CancellationToken ct)
        {
            DateTime nowUtc = DateTime.UtcNow;

            // BƯỚC 1: QUERY NHẸ
            // Chỉ lấy danh sách các Assignment cần xử lý (không Include con cháu)
            // Mục đích: Tránh Timeout khi query bảng quá lớn
            Specification<AssignmentInClass> headerSpec = new Specification<AssignmentInClass>();
            headerSpec.Conditions.Add(aic => aic.Assignment.Status == AssignmentStatus.Assigned);
            headerSpec.Conditions.Add(aic => aic.Assignment.Deadline <= nowUtc);
            
            // Chỉ include cái tối thiểu để lấy ID (thường GenericRepo cần entity root)
            headerSpec.Includes = q => q.Include(aic => aic.Assignment);

            // Lấy danh sách sơ bộ
            List<AssignmentInClass> roughList = await repository.GetListAsync(headerSpec, ct);

            if (roughList.Count == 0)
            {
                return; 
            }

            _logger.LogInformation("Tìm thấy {Count} bài tập đã hết hạn cần xử lý. Bắt đầu xử lý từng bài...", roughList.Count);

            // BƯỚC 2: VÒNG LẶP XỬ LÝ CHI TIẾT (Chia để trị)
            foreach (AssignmentInClass roughItem in roughList)
            {
                if (ct.IsCancellationRequested) break;

                try
                {
                    // Query chi tiết cho duy nhất 1 Assignment này (Query này rất nhanh vì filter theo ID)
                    Specification<AssignmentInClass> detailSpec = new Specification<AssignmentInClass>();
                    detailSpec.Conditions.Add(aic => aic.Id == roughItem.Id); // Filter cứng theo ID
                    detailSpec.Includes = q => q
                        .Include(aic => aic.Assignment)
                        .Include(aic => aic.Class)
                            .ThenInclude(c => c.Members)
                                .ThenInclude(m => m.User)
                        .Include(aic => aic.Submissions)
                            .ThenInclude(s => s.SubmitBy)
                        .Include(aic => aic.Submissions)
                            .ThenInclude(s => s.AssignmentGroup!)
                                .ThenInclude(ag => ag.GroupMembers)
                                    .ThenInclude(agm => agm.Member)
                                        .ThenInclude(m => m.User)
                        .Include(aic => aic.AssignmentGroups)
                            .ThenInclude(ag => ag.GroupMembers)
                                .ThenInclude(agm => agm.Member)
                                    .ThenInclude(m => m.User);

                    // Lấy object đầy đủ - Sử dụng GetListAsync vì GetByIdAsync chỉ nhận ID (int/object), không nhận Expression
                    AssignmentInClass assignmentInClass = (await repository.GetListAsync(detailSpec, ct)).FirstOrDefault();

                    if (assignmentInClass == null) continue;

                    // --- BẮT ĐẦU LOGIC NGHIỆP VỤ (Giữ nguyên logic của bạn) ---

                    // 1. Cập nhật trạng thái Assignment
                    assignmentInClass.Assignment.Status = AssignmentStatus.Expired;
                    assignmentInClass.Assignment.UpdatedAt = nowUtc;
                    repository.Update(assignmentInClass.Assignment);

                    // 2. Tìm học viên
                    List<ClassMember> students = assignmentInClass.Class.Members
                        .Where(m => m.RoleInClass == RoleInClass.Student)
                        .ToList();

                    // 3. Tìm danh sách đã nộp
                    HashSet<int> submittedStudentIds = new HashSet<int>();
                    if (assignmentInClass.Assignment.Type != AssignmentType.Group)
                    {
                        submittedStudentIds = assignmentInClass.Submissions
                            .Where(s => s.SubmitBy != null)
                            .Select(s => s.SubmitBy.Id)
                            .Distinct()
                            .ToHashSet();
                    }
                    else
                    {
                        submittedStudentIds = assignmentInClass.Submissions
                            .Where(s => s.AssignmentGroup?.GroupMembers != null)
                            .SelectMany(s => s.AssignmentGroup!.GroupMembers)
                            .Select(agm => agm.Member.Id)
                            .Distinct()
                            .ToHashSet();
                    }

                    // 4. Tìm người chưa nộp
                    List<ClassMember> studentsWithoutSubmission = students
                        .Where(student => !submittedStudentIds.Contains(student.Id))
                        .ToList();

                    // 5. Tìm giáo viên
                    ClassMember teacher = assignmentInClass.Class.Members.FirstOrDefault(m => m.RoleInClass == RoleInClass.Teacher);
                    // Lưu ý: Trong Background Service, hạn chế throw Exception làm chết luồng. Nên Log Error và continue.
                    if (teacher == null) 
                    {
                        _logger.LogError("Bỏ qua bài tập {Title} (ID: {Id}) vì không tìm thấy giáo viên trong lớp.", assignmentInClass.Assignment.Title, assignmentInClass.Id);
                        continue; 
                    }

                    // 6. Tạo Submission 0 điểm
                    List<Submission> newSubmissions = new List<Submission>();
                    foreach (ClassMember student in studentsWithoutSubmission)
                    {
                        Submission unsubmittedSubmission = new Submission
                        {
                            SubmitBy = student,
                            SubmittedTime = assignmentInClass.Assignment.Deadline,
                            Status = SubmissionStatus.NotSubmitted,
                            SubmittedFiles = new List<Document>(),
                            Answers = new List<QuizAnswer>(),
                            Grade = new Grade {
                                Score = 0,
                                GradedAt = DateTime.UtcNow,
                                GradedBy = teacher
                            }
                        };

                        if (assignmentInClass.Assignment.Type == AssignmentType.Group)
                        {
                            AssignmentGroup assignmentGroup = assignmentInClass.AssignmentGroups
                                .FirstOrDefault(ag => ag.GroupMembers.Any(agm => agm.Member.Id == student.Id) 
                                                    && ag.Status == AssignmentGroupStatus.Approved);
                            if (assignmentGroup != null)
                            {
                                unsubmittedSubmission.AssignmentGroup = assignmentGroup;
                            }
                        }

                        newSubmissions.Add(unsubmittedSubmission);
                    }

                    if (newSubmissions.Count > 0)
                    {
                        // Thêm submissions vào collection của assignmentInClass để EF Core tự động set FK
                        foreach (Submission sub in newSubmissions)
                        {
                            assignmentInClass.Submissions.Add(sub);
                        }
                        _logger.LogInformation("Tạo {Count} submission 0 điểm cho bài tập {Title}", newSubmissions.Count, assignmentInClass.Assignment.Title);
                    }

                    // --- KẾT THÚC LOGIC NGHIỆP VỤ ---

                    // BƯỚC 3: SAVE NGAY LẬP TỨC
                    // Lưu ý: Chỉ save thay đổi của bài tập này thôi.
                    await repository.SaveChangesAsync(ct);

                    // Mẹo nâng cao: Detach entities để giải phóng RAM cho vòng lặp tiếp theo (Tránh lỗi out of memory nếu list dài)
                    // Vì GenericRepository thường không lộ DbContext để Detach, việc dùng scope mới mỗi lần chạy loop là tốt nhất, 
                    // nhưng ở đây ta dùng SaveChangesAsync liên tục cũng đã giảm thiểu việc giữ lock DB rồi.
                }
                catch (Exception ex)
                {
                    // Catch lỗi cho từng bài tập, để 1 bài lỗi không làm chết cả tiến trình update các bài sau
                    _logger.LogError(ex, "Lỗi khi xử lý bài tập ID: {Id}", roughItem.Id);
                }
            }
        }
    }
}