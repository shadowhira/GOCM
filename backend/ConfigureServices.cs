using MSC.Shared.Services;
using OnlineClassroomManagement.Services;
namespace OnlineClassroomManagement
{
    public static class ConfigureServices
    {
        public static IServiceCollection AddConfigServices(this IServiceCollection services)
        {
            var assembly = typeof(ConfigureServices).Assembly;

            // Chỗ này để đăng ký các service
            services.AddHttpContextAccessor();
            services.AddAutoMapper(assembly);
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IClassService, ClassService>();
            services.AddScoped<IPostService, PostService>();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IQuizQuestionService, QuizQuestionService>();
            services.AddScoped<IQuizOptionService, QuizOptionService>();
            services.AddScoped<IAssignmentService, AssignmentService>();
            services.AddScoped<IStorageService, StorageService>();
            services.AddScoped<IDocumentService, DocumentService>();
            services.AddScoped<IGradeService, GradeService>();
            services.AddScoped<ISubmissionService, SubmissionService>();
            services.AddScoped<ILiveRoomService, LiveRoomService>();
            services.AddScoped<IShopItemService, ShopItemService>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<ICommentService, CommentService>();
            services.AddScoped<IRewardService, RewardService>();
            services.AddSingleton<ISupabaseService, SupabaseService>();
            services.AddScoped<IWebhookService, WebhookService>();
            services.AddScoped<IAssignmentGroupService, AssignmentGroupService>();
            services.AddScoped<IAssignmentGroupInvitationService, AssignmentGroupInvitationService>();
            services.AddScoped<IAssignmentGroupTopicService, AssignmentGroupTopicService>();
            services.AddScoped<ICalendarService, CalendarService>();
            services.AddScoped<IBaseExportExcelService, BaseExportExcelService>();
            services.AddScoped<INotificationService, NotificationService>();
            return services;
        }
    }
}
