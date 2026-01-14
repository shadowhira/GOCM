using Bogus;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models;
using OnlineClassroomManagement.Models.Entities;

namespace OnlineClassroomManagement.Seed;

public class DataSeeder
{
    private readonly AppDbContext _db;
    private readonly ILogger<DataSeeder> _logger;
    private const string TargetEmail = "thanhoc890@gmail.com";
    private const string DefaultPassword = "123456"; 

    private readonly (string Subject, string CoverUrl)[] _subjects = new[] {
        ("Phát triển Ứng dụng Web (Fullstack)", "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80"),
        ("Trí tuệ Nhân tạo & Machine Learning", "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80"),
        ("Cơ sở dữ liệu Phân tán", "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80"),
        ("An toàn & Bảo mật Thông tin", "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=1200&q=80"),
        ("Lập trình Thiết bị Di động (Flutter)", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"),
        ("Kiến trúc Microservices", "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"),
        ("Kỹ năng Mềm & Quản lý Dự án", "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80")
    };

    private readonly string[] _postContents = new[] {
        "Chia sẻ slide ôn tập chương 1 (PDF + ghi chú)",
        "Góc hỏi đáp: chưa hiểu phần đặc tả use case? comment nhé",
        "Link ghi hình buổi học + timestamp các mục quan trọng",
        "Tài liệu tham khảo: SRS template, checklist kiểm tra",
        "Cập nhật tiến độ đồ án: review module auth + demo ngắn",
        "Lịch họp nhóm: tối thứ 4, 20h, check-in Zoom trước 5 phút",
        "Chia sẻ bài giải mẫu cho bài tập 2 (để tham khảo)",
        "FAQ về deadline và cách chấm: đọc trước khi hỏi",
        "Checklist tự kiểm cho submission tuần này",
        "Mẹo trình bày báo cáo: bố cục, font, biểu đồ"
    };

    private readonly string[] _assignmentTitles = new[] {
        "Bài tập phân tích yêu cầu người dùng",
        "Thiết kế sơ đồ use case",
        "Đặc tả yêu cầu chức năng",
        "Thiết kế kiến trúc 3 lớp",
        "Viết test case cho module đăng nhập",
        "Tạo mockup màn hình chính",
        "Tối ưu truy vấn database (EXPLAIN/ANALYZE)",
        "Triển khai CI đơn giản với GitHub Actions",
        "Thiết kế API theo chuẩn REST + Swagger",
        "Viết báo cáo so sánh NoSQL vs SQL"
    };

    public DataSeeder(AppDbContext db, ILogger<DataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (await _db.Classes.CountAsync(cancellationToken) > 10)
        {
            _logger.LogInformation("Dữ liệu đã nhiều, bỏ qua seed.");
            return;
        }

        Randomizer.Seed = new Random(2025);
        var faker = new Faker("vi");

        _logger.LogInformation("🚀 Bắt đầu nạp dữ liệu Demo Pro (Cosmetic Update)...");

        // 1. TẠO USERS
        var usersToInsert = new List<User>();
        
        var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Email == TargetEmail, cancellationToken);
        if (targetUser == null)
        {
            targetUser = new User
            {
                DisplayName = "Thành Nguyễn (Dev)",
                Email = TargetEmail,
                AvatarUrl = "https://ui-avatars.com/api/?name=Thanh+Nguyen&background=0D8ABC&color=fff&size=128",
                Password = DefaultPassword,
                Role = Role.User
            };
            usersToInsert.Add(targetUser);
        }

        if (!await _db.Users.AnyAsync(u => u.Email == "admin@ocm.demo", cancellationToken))
        {
            usersToInsert.Add(new User { DisplayName = "Admin Hệ Thống", Email = "admin@ocm.demo", AvatarUrl = faker.Internet.Avatar(), Password = DefaultPassword, Role = Role.Admin });
        }

        var teachers = new List<User>();
        for (int i = 1; i <= 5; i++)
        {
            var t = new User { DisplayName = $"GV. {faker.Name.LastName()} {faker.Name.FirstName()}", Email = $"teacher{i}@ptit.edu.vn", AvatarUrl = faker.Internet.Avatar(), Password = DefaultPassword, Role = Role.User };
            teachers.Add(t);
            usersToInsert.Add(t);
        }

        var students = new List<User>();
        for (int i = 1; i <= 50; i++)
        {
            var s = new User { DisplayName = faker.Name.FullName(), Email = $"sv{i}@ptit.edu.vn", AvatarUrl = faker.Internet.Avatar(), Password = DefaultPassword, Role = Role.User };
            students.Add(s);
            usersToInsert.Add(s);
        }

        if (usersToInsert.Any())
        {
            await _db.Users.AddRangeAsync(usersToInsert, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
        }

        teachers = await _db.Users.Where(u => u.Email.Contains("teacher")).ToListAsync(cancellationToken);
        students = await _db.Users.Where(u => u.Email.Contains("sv")).ToListAsync(cancellationToken);
        
        // 2. TẠO LỚP HỌC
        var classes = new List<Class>();
        foreach (var (subjectName, coverUrl) in _subjects)
        {
            var owner = teachers[faker.Random.Int(0, teachers.Count - 1)];
            classes.Add(new Class
            {
                Name = subjectName,
                Description = $"Lớp học phần {subjectName} - Học kỳ 2 năm 2025. Giảng viên: {owner.DisplayName}",
                JoinCode = faker.Random.String2(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
                CreatedByUser = owner,
                CreatedAt = DateTime.UtcNow.AddMonths(-3),
                CoverImageUrl = coverUrl,
                CoverColor = faker.Internet.Color()
            });
        }
        await _db.Classes.AddRangeAsync(classes, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        // 3. THÀNH VIÊN LỚP
        var classMembers = new List<ClassMember>();
        foreach (var cls in classes)
        {
            classMembers.Add(new ClassMember { User = cls.CreatedByUser, Class = cls, RoleInClass = RoleInClass.Teacher, EnrollDate = cls.CreatedAt, Points = 9999 });

            classMembers.Add(new ClassMember 
            { 
                User = targetUser!, 
                Class = cls, 
                RoleInClass = RoleInClass.Student, 
                EnrollDate = cls.CreatedAt.AddDays(1), 
                Points = faker.Random.Int(500, 2000) 
            });

            var randomStudents = students.OrderBy(x => Guid.NewGuid()).Take(20);
            foreach (var s in randomStudents)
            {
                classMembers.Add(new ClassMember { User = s, Class = cls, RoleInClass = RoleInClass.Student, EnrollDate = cls.CreatedAt.AddDays(faker.Random.Int(1, 10)), Points = faker.Random.Int(0, 1000) });
            }
        }
        await _db.ClassMembers.AddRangeAsync(classMembers, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        // =========================================================================
        // 4. SHOP & VẬT PHẨM (ĐA DẠNG)
        // =========================================================================
        var shopItems = new List<ShopItem>
        {
            // Avatar Frames
            new() { Name = "Viền Tân Thủ", Description = "Khung gỗ đơn giản", CostInPoints = 50, IconUrl = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", ConfigJson = "{\"color\":\"#a16207\"}", UsageDurationDays = 999, VisualType = ShopItemVisualType.AvatarFrame, Tier = ShopItemTier.Basic, IsDefault = false },
            new() { Name = "Viền Băng Giá", Description = "Hiệu ứng tuyết rơi", CostInPoints = 400, IconUrl = "https://cdn-icons-png.flaticon.com/512/2583/2583344.png", ConfigJson = "{\"glow\":\"#38bdf8\",\"effect\":\"snow\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.AvatarFrame, Tier = ShopItemTier.Advanced, IsDefault = false },
            new() { Name = "Hào Quang Lửa", Description = "Rực cháy đam mê", CostInPoints = 600, IconUrl = "https://cdn-icons-png.flaticon.com/512/190/190411.png", ConfigJson = "{\"glow\":\"#ef4444\",\"effect\":\"fire\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.AvatarFrame, Tier = ShopItemTier.Elite, IsDefault = false },
            new() { Name = "Vương Miện Vàng", Description = "Dành cho King/Queen", CostInPoints = 1500, IconUrl = "https://cdn-icons-png.flaticon.com/512/6928/6928929.png", ConfigJson = "{\"glow\":\"#fbbf24\",\"border\":\"gold\"}", UsageDurationDays = 60, VisualType = ShopItemVisualType.AvatarFrame, Tier = ShopItemTier.Legendary, IsDefault = false },
            new() { Name = "Viền Cyberpunk", Description = "Phong cách tương lai", CostInPoints = 800, IconUrl = "https://cdn-icons-png.flaticon.com/512/2583/2583434.png", ConfigJson = "{\"glow\":\"#d946ef\",\"style\":\"neon\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.AvatarFrame, Tier = ShopItemTier.Elite, IsDefault = false },

            // Chat Frames
            new() { Name = "Chat Xanh Mát", Description = "Màu xanh dịu mắt", CostInPoints = 100, IconUrl = "https://cdn-icons-png.flaticon.com/512/2097/2097340.png", ConfigJson = "{\"bg\":\"#dcfce7\",\"border\":\"#22c55e\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.ChatFrame, Tier = ShopItemTier.Basic, IsDefault = false },
            new() { Name = "Chat Hồng Cute", Description = "Dễ thương vô đối", CostInPoints = 250, IconUrl = "https://cdn-icons-png.flaticon.com/512/2665/2665569.png", ConfigJson = "{\"bg\":\"#fce7f3\",\"border\":\"#ec4899\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.ChatFrame, Tier = ShopItemTier.Advanced, IsDefault = false },
            new() { Name = "Chat Bóng Đêm", Description = "Dark mode cực ngầu", CostInPoints = 500, IconUrl = "https://cdn-icons-png.flaticon.com/512/9407/9407633.png", ConfigJson = "{\"bg\":\"#1e293b\",\"text\":\"#f8fafc\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.ChatFrame, Tier = ShopItemTier.Elite, IsDefault = false },

            // Badges
            new() { Name = "Huy hiệu Ong Chăm", Description = "Siêng năng nộp bài", CostInPoints = 200, IconUrl = "https://cdn-icons-png.flaticon.com/512/1828/1828640.png", ConfigJson = "{\"icon\":\"bee\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.NameBadge, Tier = ShopItemTier.Basic, IsDefault = false },
            new() { Name = "Huy hiệu Đại Gia", Description = "Người giàu điểm nhất lớp", CostInPoints = 1000, IconUrl = "https://cdn-icons-png.flaticon.com/512/10628/10628965.png", ConfigJson = "{\"icon\":\"diamond\",\"anim\":\"shine\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.NameBadge, Tier = ShopItemTier.Legendary, IsDefault = false },
            new() { Name = "Thánh Deadline", Description = "Luôn nộp phút chót", CostInPoints = 300, IconUrl = "https://cdn-icons-png.flaticon.com/512/1828/1828970.png", ConfigJson = "{\"icon\":\"clock\"}", UsageDurationDays = 30, VisualType = ShopItemVisualType.NameBadge, Tier = ShopItemTier.Advanced, IsDefault = false }
        };
        
        // Gán thời gian tạo
        foreach(var item in shopItems) item.CreatedAt = DateTime.UtcNow;

        await _db.ShopItems.AddRangeAsync(shopItems, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        // ShopItemInClass
        var shopInClass = new List<ShopItemInClass>();
        foreach(var cls in classes) {
            foreach(var item in shopItems) {
                var sic = new ShopItemInClass { ShopItem = item };
                shopInClass.Add(sic);
            }
        }
        for (int i = 0; i < shopInClass.Count; i++) {
             var cls = classes[i / shopItems.Count]; 
             _db.Entry(shopInClass[i]).Property("ClassId").CurrentValue = cls.Id;
        }
        await _db.Set<ShopItemInClass>().AddRangeAsync(shopInClass, cancellationToken);
        
        // =========================================================================
        // 4.5. TRANG BỊ COSMETIC CHO SINH VIÊN (NEW)
        // =========================================================================
        var memberCosmetics = new List<ClassMemberCosmetic>();
        var avatarFrames = shopItems.Where(x => x.VisualType == ShopItemVisualType.AvatarFrame).ToList();
        var chatFrames = shopItems.Where(x => x.VisualType == ShopItemVisualType.ChatFrame).ToList();
        var badges = shopItems.Where(x => x.VisualType == ShopItemVisualType.NameBadge).ToList();

        foreach (var member in classMembers.Where(cm => cm.RoleInClass == RoleInClass.Student))
        {
            // 60% sinh viên có đeo đồ
            if (faker.Random.Bool(0.6f))
            {
                var cosmetic = new ClassMemberCosmetic 
                { 
                    ClassMember = member,
                    UpdatedAt = DateTime.UtcNow
                };

                // Random từng slot (có thể có, có thể không)
                if (faker.Random.Bool(0.7f)) cosmetic.AvatarFrameShopItem = faker.PickRandom(avatarFrames);
                if (faker.Random.Bool(0.4f)) cosmetic.ChatFrameShopItem = faker.PickRandom(chatFrames);
                if (faker.Random.Bool(0.5f)) cosmetic.BadgeShopItem = faker.PickRandom(badges);

                // Nếu có ít nhất 1 món thì add
                if (cosmetic.AvatarFrameShopItem != null || cosmetic.ChatFrameShopItem != null || cosmetic.BadgeShopItem != null)
                {
                    memberCosmetics.Add(cosmetic);
                }
            }
        }
        await _db.ClassMemberCosmetics.AddRangeAsync(memberCosmetics, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        // Mua sẵn đồ cho Target User
        var userStates = new List<UserShopItemState>();
        foreach(var cls in classes) {
             // Mua khung vàng
             userStates.Add(new UserShopItemState {
                 User = targetUser!, Class = cls, ShopItem = shopItems.First(s => s.Name == "Vương Miện Vàng"), 
                 TotalPurchases = 1, LastRedeemedAt = DateTime.UtcNow, ExpiresAt = DateTime.UtcNow.AddDays(30), CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
             });
        }
        await _db.UserShopItemStates.AddRangeAsync(userStates, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        // =========================================================================
        // 5. NỘI DUNG LỚP HỌC
        // =========================================================================
        var posts = new List<Post>();
        var postInClasses = new List<PostInClass>();
        var comments = new List<Comment>();
        var assignments = new List<Assignment>();
        var assignmentInClasses = new List<AssignmentInClass>();
        var documents = new List<Document>();
        var submissions = new List<Submission>();
        var quizQuestions = new List<QuizQuestion>();
        var quizOptions = new List<QuizOption>();

        foreach (var cls in classes)
        {
            var teacherMember = classMembers.First(cm => cm.Class == cls && cm.RoleInClass == RoleInClass.Teacher);
            var studentMembers = classMembers.Where(cm => cm.Class == cls && cm.RoleInClass == RoleInClass.Student).ToList();
            var targetMember = classMembers.First(cm => cm.Class == cls && cm.User == targetUser);

            // A. POSTS
            for (int i = 0; i < 35; i++)
            {
                var isTeacherPost = i % 5 == 0;
                var author = isTeacherPost ? teacherMember : studentMembers[faker.Random.Int(0, studentMembers.Count - 1)];
                
                string titleSample = faker.PickRandom(_postContents); // Dùng lại nội dung làm title ngắn
                string contentSample = faker.PickRandom(_postContents);

                var post = new Post
                {
                    Title = isTeacherPost ? $"Thông báo số {i+1}" : string.Join(" ", titleSample.Split(' ').Take(6)) + "...",
                    Content = contentSample + (faker.Random.Bool(0.3f) ? "" : $"\n\n(Đăng bởi {author.User.DisplayName})"),
                    CreatedBy = author,
                    CreatedAt = DateTime.UtcNow.AddDays(-faker.Random.Int(0, 60)).AddHours(faker.Random.Int(8, 20)),
                    Status = 0,
                    Comments = new List<Comment>()
                };
                posts.Add(post);
                postInClasses.Add(new PostInClass { Post = post, Class = cls });

                // Comments
                var commentCount = faker.Random.Int(3, 8);
                for (int c = 0; c < commentCount; c++)
                {
                    var cmtAuthor = studentMembers[faker.Random.Int(0, studentMembers.Count - 1)];
                    var cmt = new Comment
                    {
                        CreatedBy = cmtAuthor,
                        Content = faker.Random.Bool() ? "Cảm ơn thông tin hữu ích ạ." : "Phần này em chưa rõ lắm, có thể giải thích thêm không ạ?",
                        CreatedAt = post.CreatedAt.AddMinutes(faker.Random.Int(10, 300))
                    };
                    post.Comments.Add(cmt); 
                    comments.Add(cmt);
                }
            }

            // B. ASSIGNMENTS
            for (int a = 0; a < 5; a++) 
            {
                var isQuiz = a % 2 != 0;
                var title = faker.PickRandom(_assignmentTitles) + $" (Bài {a+1})";
                
                var assignment = new Assignment
                {
                    Title = title,
                    Content = "Yêu cầu: Đọc kỹ tài liệu đính kèm và nộp bài đúng hạn. Không copy paste.",
                    Deadline = DateTime.UtcNow.AddDays(faker.Random.Int(-5, 10)),
                    MaxScore = 100,
                    CreatedBy = teacherMember,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    Status = AssignmentStatus.Assigned,
                    Type = isQuiz ? AssignmentType.Quiz : AssignmentType.Essay,
                    AllowShowResultToStudent = true,
                    Attachments = new List<Document>(),
                    ListQuestions = new List<QuizQuestion>()
                };
                assignments.Add(assignment);
                var asmInClass = new AssignmentInClass { Assignment = assignment, Class = cls, Submissions = new List<Submission>() };
                assignmentInClasses.Add(asmInClass);

                // Document đề bài
                var attachDoc = new Document
                {
                    FileName = $"De_bai_{a+1}.pdf",
                    FileType = FileType.Pdf,
                    PublicUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    FilePath = $"classes/{cls.Id}/assignments/doc_{Guid.NewGuid()}",
                    UploadedBy = teacherMember,
                    CreatedAt = assignment.CreatedAt,
                    ParentType = ParentType.Assignment,
                    ClassId = cls.Id 
                };
                assignment.Attachments.Add(attachDoc);
                documents.Add(attachDoc);

                // Quiz Questions
                if (isQuiz)
                {
                    for (int q = 1; q <= 5; q++)
                    {
                        var question = new QuizQuestion
                        {
                            QuestionText = $"Câu hỏi trắc nghiệm số {q} về {cls.Name}?",
                            QuestionType = QuestionType.SingleChoice,
                            Point = 20,
                            Options = new List<QuizOption> {
                                new() { OptionText = "Phương án A (Đúng)", IsCorrect = true },
                                new() { OptionText = "Phương án B (Sai)", IsCorrect = false },
                                new() { OptionText = "Phương án C (Sai)", IsCorrect = false },
                                new() { OptionText = "Phương án D (Sai)", IsCorrect = false },
                            }
                        };
                        assignment.ListQuestions.Add(question);
                        quizQuestions.Add(question);
                        quizOptions.AddRange(question.Options);
                    }
                }

                // C. SUBMISSIONS
                if (a < 3)
                {
                    var isGraded = a < 2;
                    var subDoc = new Document
                    {
                        FileName = $"Bai_lam_{targetUser.DisplayName}.pdf",
                        FileType = FileType.Pdf,
                        PublicUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                        FilePath = $"submissions/doc_{Guid.NewGuid()}",
                        UploadedBy = targetMember,
                        CreatedAt = DateTime.UtcNow.AddDays(-1),
                        ParentType = ParentType.Submission,
                        ClassId = cls.Id
                    };
                    documents.Add(subDoc);

                    var sub = new Submission
                    {
                        SubmitBy = targetMember,
                        SubmittedTime = DateTime.UtcNow.AddDays(-1),
                        Content = "Em nộp bài ạ.",
                        Status = isGraded ? SubmissionStatus.Graded : SubmissionStatus.Submitted,
                        SubmittedFiles = new List<Document> { subDoc }
                    };

                    if (isGraded)
                    {
                        sub.Grade = new Grade { Score = faker.Random.Double(80, 100), Feedback = "Làm tốt lắm!", GradedBy = teacherMember, GradedAt = DateTime.UtcNow };
                    }

                    asmInClass.Submissions.Add(sub); 
                    submissions.Add(sub);
                }
            }
        }

        // SAVE DB
        _logger.LogInformation("Đang lưu Assignments, Posts, Comments... (Số lượng lớn)");
        
        await _db.Assignments.AddRangeAsync(assignments, cancellationToken);
        await _db.AssignmentInClass.AddRangeAsync(assignmentInClasses, cancellationToken);
        await _db.Documents.AddRangeAsync(documents, cancellationToken);
        
        await _db.QuizQuestions.AddRangeAsync(quizQuestions, cancellationToken);
        await _db.QuizOptions.AddRangeAsync(quizOptions, cancellationToken);
        
        await _db.Posts.AddRangeAsync(posts, cancellationToken);
        await _db.PostInClass.AddRangeAsync(postInClasses, cancellationToken);
        await _db.Comments.AddRangeAsync(comments, cancellationToken);
        
        await _db.Submissions.AddRangeAsync(submissions, cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation($"✅ SEED XONG! \nUser: {TargetEmail} \nPass: {DefaultPassword} \nĐã tạo {classes.Count} lớp, {posts.Count} bài đăng, {assignments.Count} bài tập.");
    }
}