using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Utilities;
using OnlineClassroomManagement.Models.Broadcast;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.LiveRooms;
using OnlineClassroomManagement.Models.Requests.Rewards;
using OnlineClassroomManagement.Models.Responses.Rewards;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IRewardService
    {
        Task<RewardActivityResponse> GrantPostRewardAsync(int classId, int postId, GrantRewardRequest request);
        Task<RewardActivityResponse> GrantCommentRewardAsync(int classId, int commentId, GrantRewardRequest request);
        Task<RewardActivity?> GrantInitialLiveRoomJoinAsync(LiveRoom liveRoom, ClassMember classMember);
        Task<RewardActivityResponse> GrantParticipantRewardAsync(int liveRoomId, int participantId, GrantLiveRoomParticipantRewardRequest request);
        Task<RewardActivity?> GrantOnTimeSubmissionRewardAsync(ClassMember submitter, Class classEntity, Submission submission, int assignmentId, DateTime assignmentDeadlineUtc);
        Task<RewardActivity?> GrantHighGradeRewardAsync(ClassMember submitter, Class classEntity, Submission submission, Assignment assignment);
    }

    public class RewardService : IRewardService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ISupabaseService _supabaseService;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        private static readonly IReadOnlyDictionary<string, LiveRoomRewardPreset> LiveRoomRewardPresets =
            new Dictionary<string, LiveRoomRewardPreset>
            {
                ["liveroomquickbonus"] = new LiveRoomRewardPreset(
                    ActivityType.LiveRoomQuickBonus,
                    RewardPointRules.Activities.LiveRoomQuickBonus,
                    "Thưởng nhanh trong Live Room"),
                ["manualpenalty"] = new LiveRoomRewardPreset(
                    ActivityType.ManualPenalty,
                    RewardPointRules.Activities.ManualPenalty,
                    "Điểm trừ thủ công trong Live Room")
            };

        public RewardService(IRepository repository, ICurrentUserService currentUserService, ISupabaseService supabaseService, IMapper mapper, INotificationService notificationService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _supabaseService = supabaseService;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<RewardActivityResponse> GrantPostRewardAsync(int classId, int postId, GrantRewardRequest request)
        {
            (Class classEntity, ClassMember teacherMember) = await RequireTeacherContext(classId);
            int points = ResolvePoints(request?.Points, RewardPointRules.Activities.PostContribution);
            string? reason = request?.Reason?.Trim();

            // Validate điểm trong phạm vi cho phép
            ValidatePointsInRange(points, RewardPointRules.Ranges.PostRewardMin, RewardPointRules.Ranges.PostRewardMax, "thưởng bài viết");

            Specification<PostInClass> spec = new();
            spec.Conditions.Add(pic => pic.Class.Id == classId && pic.Post.Id == postId);
            spec.Includes = query => query
                .Include(pic => pic.Post)
                    .ThenInclude(p => p.CreatedBy)
                        .ThenInclude(cm => cm.User);

            PostInClass? targetPost = await _repository.GetAsync(spec);
            if (targetPost?.Post?.CreatedBy == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bài đăng trong lớp này");
            }

            // Validate giới hạn điểm thưởng trong ngày
            await ValidateDailyRewardLimitAsync(classId, targetPost.Post.CreatedBy.User.Id, points);

            RewardActivity activity = await GrantInternalAsync(
                targetPost.Post.CreatedBy,
                classEntity,
                ActivityType.PostContribution,
                points,
                reason,
                ParentType.Post,
                postId,
                teacherMember);
            
            return _mapper.Map<RewardActivityResponse>(activity);
        }

        public async Task<RewardActivityResponse> GrantCommentRewardAsync(int classId, int commentId, GrantRewardRequest request)
        {
            (Class classEntity, ClassMember teacherMember) = await RequireTeacherContext(classId);
            int points = ResolvePoints(request?.Points, RewardPointRules.Activities.CommentContribution);
            string? reason = request?.Reason?.Trim();

            // Validate điểm trong phạm vi cho phép
            ValidatePointsInRange(points, RewardPointRules.Ranges.CommentRewardMin, RewardPointRules.Ranges.CommentRewardMax, "thưởng bình luận");

            Specification<Comment> commentSpec = new();
            commentSpec.Conditions.Add(c => c.Id == commentId);
            commentSpec.Includes = query => query
                .Include(c => c.CreatedBy)
                    .ThenInclude(cm => cm.User);

            Comment? comment = await _repository.GetAsync(commentSpec);
            if (comment?.CreatedBy == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy bình luận");
            }

            Specification<PostInClass> linkageSpec = new();
            linkageSpec.Conditions.Add(pic => pic.Class.Id == classId && pic.Post.Comments.Any(c => c.Id == commentId));
            linkageSpec.Includes = query => query.Include(pic => pic.Post);

            PostInClass? postInClass = await _repository.GetAsync(linkageSpec);
            if (postInClass == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Bình luận không thuộc lớp học này");
            }

            // Validate giới hạn điểm thưởng trong ngày
            await ValidateDailyRewardLimitAsync(classId, comment.CreatedBy.User.Id, points);

            RewardActivity activity = await GrantInternalAsync(
                comment.CreatedBy,
                classEntity,
                ActivityType.CommentContribution,
                points,
                reason,
                ParentType.Comment,
                commentId,
                teacherMember);
            
            return _mapper.Map<RewardActivityResponse>(activity);
        }

        public async Task<RewardActivity?> GrantInitialLiveRoomJoinAsync(LiveRoom liveRoom, ClassMember classMember)
        {
            if (liveRoom.Class == null || classMember?.User == null)
            {
                return null;
            }

            if (RewardPointRules.InitialLiveRoomJoinPoints <= 0)
            {
                return null;
            }

            bool alreadyRewarded = await _repository.ExistsAsync<RewardActivity>(
                ra => ra.Class.Id == liveRoom.Class.Id
                    && ra.User.Id == classMember.User.Id
                    && ra.ParentType == ParentType.LiveRoom
                    && ra.ParentId == liveRoom.Id
                    && ra.Type == ActivityType.InitialLiveRoomJoin);

            if (alreadyRewarded)
            {
                return null;
            }

            return await GrantInternalAsync(
                classMember,
                liveRoom.Class,
                ActivityType.InitialLiveRoomJoin,
                RewardPointRules.InitialLiveRoomJoinPoints,
                "Tham gia lớp học trực tuyến lần đầu",
                ParentType.LiveRoom,
                liveRoom.Id,
                null);
        }

        public async Task<RewardActivityResponse> GrantParticipantRewardAsync(int liveRoomId, int participantId, GrantLiveRoomParticipantRewardRequest request)
        {
            if (request == null)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Payload thưởng nhanh không hợp lệ");
            }

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(lr => lr.Id == liveRoomId)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy phòng trực tuyến");

            if (liveRoom.Status != LiveRoomStatus.InProgress)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ có thể thưởng điểm khi phòng đang diễn ra");
            }

            RewardActivity activity = await GrantLiveRoomRewardInternalAsync(liveRoomId, participantId, request);
            RewardActivityResponse response = _mapper.Map<RewardActivityResponse>(activity);

            LiveRoomRewardBroadcast broadcast = new()
            {
                ParticipantId = participantId,
                RewardActivityId = activity.Id,
                ClassId = activity.Class.Id,
                TargetUserId = activity.User.Id,
                TargetDisplayName = activity.User.DisplayName,
                ActivityType = activity.Type,
                DeltaPoints = activity.TotalEarnedPoints,
                Reason = activity.Reason
            };

            await _supabaseService.SendLiveRoomRewardEvent(Utility.GenLiveRoomChannel(liveRoomId), broadcast);

            return response;
        }

        private async Task<RewardActivity> GrantLiveRoomRewardInternalAsync(int liveRoomId, int participantId, GrantLiveRoomParticipantRewardRequest request)
        {
            if (request == null)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Payload thưởng nhanh không hợp lệ");
            }

            LiveRoomRewardPreset preset = ResolveLiveRoomRewardPreset(request.Reason);

            Specification<Participant> participantSpec = new();
            participantSpec.Conditions.Add(p => p.Id == participantId && p.LiveRoom.Id == liveRoomId);
            participantSpec.Includes = query => query
                .Include(p => p.ClassMember)
                    .ThenInclude(cm => cm.User)
                .Include(p => p.LiveRoom)
                    .ThenInclude(lr => lr.Class)
                        .ThenInclude(c => c.Members)
                            .ThenInclude(m => m.User);

            Participant? participant = await _repository.GetAsync(participantSpec);
            if (participant == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy người tham gia trong phòng học");
            }

            LiveRoom? liveRoom = participant.LiveRoom;
            if (liveRoom == null || liveRoom.Class == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học của phòng trực tuyến");
            }

            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Vui lòng đăng nhập để thao tác");
            }

            if (liveRoom.Class.Members == null)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Không thể xác định quyền của bạn trong lớp học này");
            }

            ClassMember? grantedBy = liveRoom.Class.Members.FirstOrDefault(m => m.User.Id == currentUser.Id);
            if (grantedBy == null || grantedBy.RoleInClass != RoleInClass.Teacher)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ host mới có thể cộng/trừ điểm trong Live Room");
            }

            ClassMember? targetMember = participant.ClassMember;
            if (targetMember == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thành viên lớp của người nhận điểm");
            }

            // Validate giới hạn theo ngày
            if (preset.Points > 0)
            {
                await ValidateDailyRewardLimitAsync(liveRoom.Class.Id, targetMember.User.Id, preset.Points);
            }
            else if (preset.Points < 0)
            {
                await ValidateDailyPenaltyLimitAsync(liveRoom.Class.Id, targetMember.User.Id, preset.Points);
            }

            string? reason = ResolveLiveRoomReason(request.Note, preset);

            return await GrantInternalAsync(
                targetMember,
                liveRoom.Class,
                preset.ActivityType,
                preset.Points,
                reason,
                ParentType.LiveRoom,
                liveRoom.Id,
                grantedBy);
        }

        private async Task<(Class ClassEntity, ClassMember TeacherMember)> RequireTeacherContext(int classId)
        {
            User? currentUser = await _currentUserService.GetCurrentUserInfo();
            if (currentUser == null)
            {
                throw new CustomException(ExceptionCode.Unauthorized, "Vui lòng đăng nhập để thao tác");
            }

            Specification<Class> spec = new();
            spec.Conditions.Add(c => c.Id == classId);
            spec.Includes = query => query
                .Include(c => c.Members)
                    .ThenInclude(m => m.User);

            Class? classEntity = await _repository.GetAsync(spec);
            if (classEntity == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học");
            }

            ClassMember? member = classEntity.Members.FirstOrDefault(m => m.User.Id == currentUser.Id);
            if (member == null)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Bạn không thuộc lớp học này");
            }

            if (member.RoleInClass != RoleInClass.Teacher)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ giảng viên mới được phép thưởng điểm");
            }

            return (classEntity, member);
        }

        private static LiveRoomRewardPreset ResolveLiveRoomRewardPreset(string? reasonKey)
        {
            string normalizedKey = NormalizeReasonKey(reasonKey);
            if (string.IsNullOrWhiteSpace(normalizedKey) || !LiveRoomRewardPresets.TryGetValue(normalizedKey, out LiveRoomRewardPreset preset))
            {
                throw new CustomException(ExceptionCode.Invalidate, "Lý do thưởng nhanh không hợp lệ");
            }

            if (preset.Points == 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Giá trị thưởng không hợp lệ");
            }

            return preset;
        }

        private static string NormalizeReasonKey(string? rawKey)
        {
            if (string.IsNullOrWhiteSpace(rawKey))
            {
                return string.Empty;
            }

            string trimmed = rawKey.Trim();
            string normalized = new string(trimmed
                .Where(char.IsLetterOrDigit)
                .Select(char.ToLowerInvariant)
                .ToArray());

            return normalized;
        }

        private static string? ResolveLiveRoomReason(string? customReason, LiveRoomRewardPreset preset)
        {
            if (!string.IsNullOrWhiteSpace(customReason))
            {
                return customReason.Trim();
            }

            return preset.DefaultReason;
        }

        private static int ResolvePoints(int? requestPoints, int defaultPoints)
        {
            int points = requestPoints ?? defaultPoints;
            if (points <= 0)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Số điểm phải lớn hơn 0");
            }

            return points;
        }

        /// <summary>
        /// Kiểm tra giới hạn điểm thưởng trong ngày
        /// </summary>
        private async Task ValidateDailyRewardLimitAsync(int classId, int userId, int requestedPoints)
        {
            DateTime todayUtc = DateTime.UtcNow.Date;
            DateTime tomorrowUtc = todayUtc.AddDays(1);

            // Tính tổng điểm đã thưởng trong ngày (chỉ tính thưởng thủ công)
            int todayRewardedPoints = await _repository.GetQueryable<RewardActivity>()
                .Where(ra => ra.Class.Id == classId
                    && ra.User.Id == userId
                    && ra.CreatedAt >= todayUtc
                    && ra.CreatedAt < tomorrowUtc
                    && ra.TotalEarnedPoints > 0
                    && (ra.Type == ActivityType.PostContribution 
                        || ra.Type == ActivityType.CommentContribution
                        || ra.Type == ActivityType.LiveRoomQuickBonus))
                .SumAsync(ra => ra.TotalEarnedPoints);

            if (todayRewardedPoints + requestedPoints > RewardPointRules.MaxManualRewardPerDay)
            {
                int remaining = Math.Max(0, RewardPointRules.MaxManualRewardPerDay - todayRewardedPoints);
                throw new CustomException(
                    ExceptionCode.NotAllowUpdate, 
                    $"Học sinh này đã nhận {todayRewardedPoints} điểm hôm nay. " +
                    $"Giới hạn: {RewardPointRules.MaxManualRewardPerDay} điểm/ngày. " +
                    $"Còn lại: {remaining} điểm.");
            }
        }

        /// <summary>
        /// Kiểm tra giới hạn điểm phạt trong ngày
        /// </summary>
        private async Task ValidateDailyPenaltyLimitAsync(int classId, int userId, int requestedPenalty)
        {
            DateTime todayUtc = DateTime.UtcNow.Date;
            DateTime tomorrowUtc = todayUtc.AddDays(1);

            // Tính tổng điểm phạt trong ngày (giá trị âm)
            int todayPenaltyPoints = await _repository.GetQueryable<RewardActivity>()
                .Where(ra => ra.Class.Id == classId
                    && ra.User.Id == userId
                    && ra.CreatedAt >= todayUtc
                    && ra.CreatedAt < tomorrowUtc
                    && ra.TotalEarnedPoints < 0
                    && ra.Type == ActivityType.ManualPenalty)
                .SumAsync(ra => Math.Abs(ra.TotalEarnedPoints));

            int absolutePenalty = Math.Abs(requestedPenalty);
            if (todayPenaltyPoints + absolutePenalty > RewardPointRules.MaxPenaltyPerDay)
            {
                int remaining = Math.Max(0, RewardPointRules.MaxPenaltyPerDay - todayPenaltyPoints);
                throw new CustomException(
                    ExceptionCode.NotAllowUpdate, 
                    $"Học sinh này đã bị trừ {todayPenaltyPoints} điểm hôm nay. " +
                    $"Giới hạn phạt: {RewardPointRules.MaxPenaltyPerDay} điểm/ngày. " +
                    $"Còn có thể trừ: {remaining} điểm.");
            }
        }

        /// <summary>
        /// Validate điểm trong phạm vi cho phép
        /// </summary>
        private static void ValidatePointsInRange(int points, int min, int max, string activityName)
        {
            if (points < min || points > max)
            {
                throw new CustomException(
                    ExceptionCode.Invalidate, 
                    $"Điểm {activityName} phải trong khoảng {min}-{max}. Giá trị nhận: {points}");
            }
        }

        private async Task<RewardActivity> GrantInternalAsync(
            ClassMember targetMember,
            Class classEntity,
            ActivityType activityType,
            int points,
            string? reason,
            ParentType? parentType,
            int? parentId,
            ClassMember? grantedBy)
        {
            if (targetMember.User == null)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Không tìm thấy người nhận điểm");
            }

            targetMember.Points += points;
            _repository.Update(targetMember);

            RewardActivity activity = new()
            {
                Class = classEntity,
                User = targetMember.User,
                Type = activityType,
                TotalEarnedPoints = points,
                ParentType = parentType,
                ParentId = parentId,
                Reason = string.IsNullOrWhiteSpace(reason) ? null : reason,
                GrantedBy = grantedBy,
                CreatedAt = DateTime.UtcNow,
            };

            _repository.Add(activity);
            await _repository.SaveChangesAsync();

            // Notify the target user about points changes
            string notificationType = activityType switch
            {
                ActivityType.PostContribution => "reward_post_granted",
                ActivityType.CommentContribution => "reward_comment_granted",
                ActivityType.InitialLiveRoomJoin => "reward_initial_live_room_join",
                ActivityType.LiveRoomQuickBonus => "reward_live_room_points_updated",
                ActivityType.ManualPenalty => "reward_live_room_points_updated",
                ActivityType.OnTimeSubmission => "reward_on_time_submission",
                ActivityType.HighGrade => "reward_high_grade",
                _ => "reward_points_updated"
            };

            int senderId = grantedBy?.User?.Id ?? targetMember.User.Id;

            await _notificationService.CreateNotification(new CreateNotificationRequest
            {
                Type = notificationType,
                Data = new Dictionary<string, string>
                {
                    { "className", classEntity.Name ?? string.Empty },
                    { "deltaPoints", points.ToString() },
                    { "reason", activity.Reason ?? string.Empty },
                    { "activityType", activityType.ToString() }
                },
                SenderId = senderId,
                ReceiverIds = new List<int> { targetMember.User.Id },
                LinkRedirect = $"/class/{classEntity.Id}",
                OpenNewTab = false,
                NeedSendEmail = false
            });

            return activity;
        }

        public async Task<RewardActivity?> GrantOnTimeSubmissionRewardAsync(ClassMember submitter, Class classEntity, Submission submission, int assignmentId, DateTime assignmentDeadlineUtc)
        {
            if (submitter?.User == null || classEntity == null || submission == null)
            {
                return null;
            }

            if (RewardPointRules.Activities.OnTimeSubmission <= 0)
            {
                return null;
            }

            if (!submission.SubmittedTime.HasValue || submission.SubmittedTime.Value > assignmentDeadlineUtc)
            {
                return null;
            }

            // Check if user already received reward for this assignment (prevents gaming via cancel+resubmit)
            bool alreadyRewarded = await HasAssignmentRewardAsync(classEntity.Id, submitter.User.Id, ActivityType.OnTimeSubmission, assignmentId);
            if (alreadyRewarded)
            {
                return null;
            }

            return await GrantInternalAsync(
                submitter,
                classEntity,
                ActivityType.OnTimeSubmission,
                RewardPointRules.Activities.OnTimeSubmission,
                "Nộp bài đúng hạn",
                ParentType.Assignment,  // Changed from Submission to Assignment for tracking
                assignmentId,           // Use assignmentId instead of submissionId
                null);
        }

        public async Task<RewardActivity?> GrantHighGradeRewardAsync(ClassMember submitter, Class classEntity, Submission submission, Assignment assignment)
        {
            if (submitter?.User == null || classEntity == null || submission?.Grade == null || assignment == null)
            {
                return null;
            }

            if (RewardPointRules.Activities.HighGradeBonus <= 0)
            {
                return null;
            }

            double normalizedScore = CalculateNormalizedScorePercentage(submission.Grade.Score, assignment.MaxScore);
            if (normalizedScore < RewardPointRules.Thresholds.HighGradeScore)
            {
                return null;
            }

            // Check if user already received high grade reward for this assignment (prevents gaming via cancel+resubmit)
            bool alreadyRewarded = await HasAssignmentRewardAsync(classEntity.Id, submitter.User.Id, ActivityType.HighGrade, assignment.Id);
            if (alreadyRewarded)
            {
                return null;
            }

            string reason = $"Điểm cao {Math.Round(normalizedScore, 1)}%";

            return await GrantInternalAsync(
                submitter,
                classEntity,
                ActivityType.HighGrade,
                RewardPointRules.Activities.HighGradeBonus,
                reason,
                ParentType.Assignment,  // Changed from Submission to Assignment for tracking
                assignment.Id,          // Use assignmentId instead of submissionId
                null);
        }

        private static double CalculateNormalizedScorePercentage(double score, double maxScore)
        {
            if (maxScore > 0)
            {
                return (score / maxScore) * 100d;
            }

            return score;
        }

        /// <summary>
        /// Check if user has already received a specific reward type for an assignment.
        /// This prevents point exploitation via cancel and resubmit.
        /// </summary>
        private Task<bool> HasAssignmentRewardAsync(int classId, int userId, ActivityType activityType, int assignmentId)
        {
            return _repository.ExistsAsync<RewardActivity>(ra =>
                ra.Class.Id == classId &&
                ra.User.Id == userId &&
                ra.Type == activityType &&
                ra.ParentType == ParentType.Assignment &&
                ra.ParentId == assignmentId);
        }

        private Task<bool> HasSubmissionRewardAsync(int classId, int userId, ActivityType activityType, int submissionId)
        {
            return _repository.ExistsAsync<RewardActivity>(ra =>
                ra.Class.Id == classId &&
                ra.User.Id == userId &&
                ra.Type == activityType &&
                ra.ParentType == ParentType.Submission &&
                ra.ParentId == submissionId);
        }

        private sealed record LiveRoomRewardPreset(ActivityType ActivityType, int Points, string DefaultReason);
    }
}
