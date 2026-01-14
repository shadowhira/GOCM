using AutoMapper;
using Common.Exceptions;
using Livekit.Server.Sdk.Dotnet;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Utilities;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.LiveRooms;
using OnlineClassroomManagement.Models.Responses.LiveRooms;
using OnlineClassroomManagement.Models.Responses.Messages;
using OnlineClassroomManagement.Models.Responses.Participants;
using TanvirArjel.EFCore.GenericRepository;
namespace OnlineClassroomManagement.Services
{
    public interface ILiveRoomService
    {
        Task<List<LiveRoomResponse>> GetAllLiveRooms();
        Task<PaginatedList<LiveRoomResponse>> GetListLiveRooms(GetPaginatedLiveRoomsRequest request);
        Task<LiveRoomResponse> GetLiveRoomById(int id);
        Task CreateLiveRoom(CreateLiveRoomRequest request);
        Task UpdateLiveRooms(UpdateLiveRoomRequest request);
        Task DeleteLiveRooms(int id);
        Task<JoinRoomResponse> JoinRoom(JoinRoomRequest request);
        Task RaiseHand(UpdatePartipantRaiseHandRequest request);
        Task<List<ParticipantResponse>> GetParticipantsByRoomId(int liveRoomId);
        Task SendMessage(CreateLiveRoomMessageRequest request);
        Task<List<MessageResponse>> GetMessagesByLiveRoomId(long liveRoomId);
        Task RemoveParticipantRequest(RemoveParticipantRequest request);
        Task CreateRoomNotification(CreateRoomNotificationRequest request);
        Task<LiveRoomStatisticResponse> GetLiveRoomStatisticByLiveRoomId(int liveRoomId);

        Task EndLiveRoom(int liveRoomId);
    }

    public class LiveRoomService : ILiveRoomService
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;
        private readonly ISupabaseService _supabaseService;
        private readonly IRewardService _rewardService;
        private readonly INotificationService _notificationService;

        public LiveRoomService(IRepository repository, IMapper mapper, ICurrentUserService currentUserService, IConfiguration configuration,
            ISupabaseService supabaseService, IRewardService rewardService, INotificationService notificationService)
        {
            _repository = repository;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _configuration = configuration;
            _supabaseService = supabaseService;
            _rewardService = rewardService;
            _notificationService = notificationService;
        }
        public async Task<List<LiveRoomResponse>> GetAllLiveRooms()
        {
            Specification<LiveRoom> spec = new();
            spec.Includes = q => q
                .Include(e => e.Class)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.User)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            List<LiveRoom> rooms = await _repository.GetListAsync(spec);
            return _mapper.Map<List<LiveRoomResponse>>(rooms);
        }

        public async Task<PaginatedList<LiveRoomResponse>> GetListLiveRooms(GetPaginatedLiveRoomsRequest request)
        {
            PaginationSpecification<LiveRoom> spec = new();
            spec.PageSize = request.PageSize;
            spec.PageIndex = request.PageNumber;
            spec.OrderBy = q => q.OrderByDescending(e => e.Id);

            spec.Includes = q => q
                .Include(e => e.Class)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.User)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);


            if (request.ClassId.HasValue)
            {
                spec.Conditions.Add(e => e.Class.Id == request.ClassId);
            }

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                spec.Conditions.Add(e => e.Title.ToLower().Contains(request.Keyword.ToLower()));
            }

            PaginatedList<LiveRoom> liveRooms = await _repository.GetListAsync(spec);
            return new PaginatedList<LiveRoomResponse>(_mapper.Map<List<LiveRoomResponse>>(liveRooms.Items), liveRooms.TotalItems, liveRooms.PageIndex, liveRooms.PageSize);
        }
        public async Task CreateLiveRoom(CreateLiveRoomRequest request)
        {
            User user = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin user");

            Class userClass = await _repository.GetAsync<Class>(
                e => e.Id == request.ClassId,
                includes: q => q.Include(e => e.Members).ThenInclude(cm => cm.User))
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin lớp học");

            ClassMember classMember = userClass.Members.FirstOrDefault(e => e.User.Id == user.Id)
                ?? throw new CustomException(ExceptionCode.NotFound, "User không thuộc về lớp học");

            // Validate 
            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw new CustomException(ExceptionCode.Invalidate, "Chỉ giảng viên mới có thể tạo được phòng học trực tuyến");
            }
            // 

            LiveRoom liveRoom = _mapper.Map<LiveRoom>(request);
            liveRoom.Status = LiveRoomStatus.NotStarted;
            liveRoom.ScheduledStartAt = request.ScheduledStartAt;
            liveRoom.ScheduledEndAt = request.ScheduledEndAt;
            liveRoom.CreatedBy = classMember;
            liveRoom.CreatedAt = DateTime.UtcNow;
            liveRoom.Class = userClass;

            await _repository.AddAsync(liveRoom);
            await _repository.SaveChangesAsync();

            // Tạo thông báo cho tất cả member trong class
            CreateNotificationRequest notiRequest = new()
            {
                Type = "live_room_created",
                Data = new Dictionary<string, string>
                {
                    ["roomTitle"] = liveRoom.Title,
                    ["className"] = userClass.Name,
                    ["teacherName"] = user.DisplayName
                },
                SenderId = user.Id,
                ReceiverIds = userClass.Members.Where(m => m.User.Id != user.Id).Select(m => m.User.Id).ToList(), // 
                LinkRedirect = $"/class/{userClass.Id}/live-room",
                OpenNewTab = false,
                NeedSendEmail = false,
            };
            await _notificationService.CreateNotification(notiRequest);
        }

        public async Task DeleteLiveRooms(int id)
        {
            User user = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin user");

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(e => e.Id == id, includes: q => q.Include(e => e.CreatedBy).ThenInclude(cm => cm.User));

            // Validate
            if (user.Id != liveRoom.CreatedBy.User.Id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ người tạo mới có thể xóa");
            }

            if (liveRoom.Status != LiveRoomStatus.NotStarted)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, $"Không thể xóa phòng học ở trạng thái: {liveRoom.Status.GetText()}");
            }


            _repository.Remove(liveRoom);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateLiveRooms(UpdateLiveRoomRequest request)
        {
            User user = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin user");

            Specification<LiveRoom> spec = new();
            spec.Conditions.Add(e => e.Id == request.Id);
            spec.Includes = q => q.Include(e => e.Class)
                .Include(e => e.CreatedBy).ThenInclude(cm => cm.User)
                .Include(e => e.Class).ThenInclude(c => c.Members).ThenInclude(m => m.User);

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(spec);
            // Validate
            if (user.Id != liveRoom.CreatedBy.User.Id)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, "Chỉ người tạo mới có thể chỉnh sửa");
            }

            if (liveRoom.Status != LiveRoomStatus.NotStarted)
            {
                throw new CustomException(ExceptionCode.NotAllowUpdate, $"Không thể cập nhật phòng học ở trạng thái: {liveRoom.Status.GetText()}");
            }
            //
            _mapper.Map<UpdateLiveRoomRequest, LiveRoom>(request, liveRoom);
            liveRoom.ScheduledStartAt = request.ScheduledStartAt;
            liveRoom.ScheduledEndAt = request.ScheduledEndAt;
            _repository.Update(liveRoom);
            await _repository.SaveChangesAsync();

            // Tạo thông báo cho tất cả member trong class
            CreateNotificationRequest notiRequest = new()
            {
                Type = "live_room_updated",
                Data = new Dictionary<string, string>
                {
                    ["roomTitle"] = liveRoom.Title,
                    ["className"] = liveRoom.Class.Name,
                    ["teacherName"] = user.DisplayName
                },
                SenderId = user.Id,
                ReceiverIds = liveRoom.Class.Members.Where(m => m.User.Id != user.Id).Select(m => m.User.Id).ToList(), // 
                LinkRedirect = $"/class/{liveRoom.Class.Id}/live-room",
                OpenNewTab = false,
                NeedSendEmail = false,
            };
            await _notificationService.CreateNotification(notiRequest);
        }

        public async Task<LiveRoomResponse> GetLiveRoomById(int id)
        {
            Specification<LiveRoom> spec = new();
            spec.Conditions.Add(e => e.Id == id);
            spec.Includes = q => q
                .Include(e => e.Class)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.User)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.CreatedBy).ThenInclude(cb => cb.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            LiveRoom liveRoom = await _repository.GetAsync(spec);
            return _mapper.Map<LiveRoomResponse>(liveRoom);
        }

        public async Task<JoinRoomResponse> JoinRoom(JoinRoomRequest request)
        {
            // Note: Auto tạo mới participant khi join room & mỗi participant có một identity riêng
            User currentUser = await _currentUserService.GetCurrentUserInfo() ?? throw new CustomException(ExceptionCode.NotFound, "Current user not found");

            // Tìm live room & participant theo user id
            Specification<LiveRoom> liveRoomSpec = new();
            liveRoomSpec.Conditions.Add(e => e.Id == request.LiveRoomId);
            liveRoomSpec.Includes = q => q
                .Include(e => e.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.User)
                .Include(e => e.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(m => m.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(liveRoomSpec) ?? throw new CustomException(ExceptionCode.NotFound, "Live room not found");

            if (liveRoom.Class == null)
            {
                throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy lớp học của phòng trực tuyến");
            }


            ClassMember? classMember = liveRoom.Class.Members.FirstOrDefault(e => e.User.Id == currentUser.Id)
                ?? throw new CustomException(ExceptionCode.NotFound, "User không thuộc về lớp học");

            // Check join room dựa theo status
            if (liveRoom.Status == LiveRoomStatus.Completed)
            {
                throw new CustomException(ExceptionCode.NotAllowJoinRoom, "Phòng học đã kết thúc!");
            }

            if (liveRoom.Status == LiveRoomStatus.NotStarted && classMember.RoleInClass == RoleInClass.Student)
            {
                throw new CustomException(ExceptionCode.NotAllowJoinRoom, "Phòng học chưa diễn ra, chờ giảng viên bắt đầu phòng học!");
            }

            // Tạo thông báo khi phòng họp lần đầu chuyển trạng thái -> Đang diễn ra
            bool need2CreateNotification = liveRoom.Status == LiveRoomStatus.NotStarted && classMember.RoleInClass == RoleInClass.Teacher;

            Participant participant = new Participant
            {
                ClassMember = classMember,
                LiveRoom = liveRoom,
                IsRaisingHand = false,
                JoinAt = DateTime.UtcNow,
                LeaveAt = null
            };

            _repository.Add(participant);

            liveRoom.Status = LiveRoomStatus.InProgress;
            _repository.Update(liveRoom);

            await _repository.SaveChangesAsync();

            participant.LivekitIdentity = GenParticipantIndentity(currentUser, participant);
            _repository.Update(participant);


            await _repository.SaveChangesAsync();

            bool hasJoinedBefore = await _repository.ExistsAsync<Participant>(
                p => p.LiveRoom.Id == request.LiveRoomId && p.ClassMember.Id == classMember.Id);

            if (!hasJoinedBefore)
            {
                await _rewardService.GrantInitialLiveRoomJoinAsync(liveRoom, classMember);
            }

            IConfigurationSection livekit = _configuration.GetSection("Livekit");
            string? apiKey = livekit["Key"];
            string? apiSecret = livekit["Secret"];
            string livekitServerUrl = livekit["ServerUrl"] ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy livekit server url! Kiểm tra appsetting.json");

            string roomName = GenLiveRoomName(liveRoom);
            string participantDisplayName = currentUser.DisplayName;

            // Tìm participants cũ trong phòng (cùng userId và liveRoomId) và kick ra khỏi phòng nếu có (Vì sẽ ảnh hưởng tới tính chính xác của tính năng log)
            Specification<Participant> participantSpec = new();
            participantSpec.Conditions.Add(e => e.ClassMember.User.Id == currentUser.Id && e.LiveRoom.Id == request.LiveRoomId && e.Id != participant.Id);
            //participantSpec.Includes = q => q.Include(e => e.ClassMember).ThenInclude(cm => cm.User);
            List<Participant> oldParticipants = await _repository.GetListAsync(participantSpec);

            RoomServiceClient roomService = new RoomServiceClient(livekitServerUrl, apiKey, apiSecret);
            foreach (Participant oldParticipant in oldParticipants)
            {
                try
                {
                    RoomParticipantIdentity removeRequest = new RoomParticipantIdentity()
                    {
                        Identity = oldParticipant.LivekitIdentity,
                        Room = roomName,
                    };
                    roomService.RemoveParticipant(removeRequest);
                }
                catch (Exception e)
                {

                }
            }

            if (need2CreateNotification)
            {
                CreateNotificationRequest notiRequest = new()
                {
                    Type = "live_room_in_progress",
                    Data = new Dictionary<string, string>
                    {
                        ["roomTitle"] = liveRoom.Title,
                        ["className"] = liveRoom.Class.Name
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = liveRoom.Class.Members.Where(m => m.User.Id != currentUser.Id).Select(m => m.User.Id).ToList(), // 
                    LinkRedirect = $"/live-room/{liveRoom.Id}",
                    OpenNewTab = true,
                    NeedSendEmail = false,
                };
                await _notificationService.CreateNotification(notiRequest);
            }

            // TODO: It's possible to customize the permissions of each participant.
            // See more details at access tokens guide. https://docs.livekit.io/home/get-started/authentication/#room-permissions
            AccessToken accessToken = new AccessToken(apiKey, apiSecret)
            .WithIdentity(participant.LivekitIdentity)
            .WithName(participantDisplayName)
            .WithGrants(new VideoGrants { RoomJoin = true, Room = roomName })
            .WithAttributes(new Dictionary<string, string> { { "ParticipantId", participant.Id.ToString() } }) // Customize data
            .WithTtl(TimeSpan.FromHours(1));

            // Đã sử dụng socket của livekit
            string liveRoomChannel = Utility.GenLiveRoomChannel(request.LiveRoomId);
            //await _supabaseService.SendParticipantJoinRoomEvent(GenLiveRoomChannel(request.LiveRoomId), participant);
            await _supabaseService.SendRoomNotificationsEvent(Utility.GenLiveRoomChannel(request.LiveRoomId), RoomNotificationType.JoinRoom, $"{currentUser.DisplayName} đã tham gia phòng");

            string token = accessToken.ToJwt();

            return new JoinRoomResponse()
            {
                AccessToken = token,
                Participant = _mapper.Map<ParticipantResponse>(participant),
                RoomName = roomName,
                ParticipantName = participantDisplayName,
                LivekitServerUrl = livekitServerUrl,
                LiveRoomBroadcastChannel = Utility.GenLiveRoomChannel(liveRoom.Id)
            };
        }

        public async Task RaiseHand(UpdatePartipantRaiseHandRequest request)
        {
            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(e => e.Id == request.LiveRoomId)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy phòng học");

            Participant participant = await _repository.GetAsync<Participant>(
                e => e.Id == request.ParticipantId,
                includes: q => q
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.User)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem))
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy participant");
            participant.IsRaisingHand = request.IsRaisingHand;

            _repository.Update(participant);
            await _repository.SaveChangesAsync();

            string liveRoomChannel = Utility.GenLiveRoomChannel(request.LiveRoomId);

            // Send broadcast event
            await _supabaseService.SendParticipantRaiseHandBroadCastMessage(liveRoomChannel, participant);

            if (request.IsRaisingHand)
            {
                await _supabaseService.SendRoomNotificationsEvent(liveRoomChannel, RoomNotificationType.RaiseHand, $"{participant.ClassMember.User.DisplayName} đã giơ tay");
            }

            // Note: Đang sử dụng supabase làm db -> Có thể listenChangse ở bảng Participants để cập nhật trạng thái giơ tay (Trường hợp dùng db khác -> dùng websocket để sync)
        }

        public async Task<List<ParticipantResponse>> GetParticipantsByRoomId(int liveRoomId)
        {
            Specification<LiveRoom> roomSpec = new();
            roomSpec.Conditions.Add(e => e.Id == liveRoomId);

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(roomSpec) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy phòng học!");
            IConfigurationSection livekit = _configuration.GetSection("Livekit");
            string? apiKey = livekit["Key"];
            string? apiSecret = livekit["Secret"];
            string livekitServerUrl = livekit["ServerUrl"] ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy livekit server url! Kiểm tra appsetting.json");

            // Lấy participant ĐANG trong phòng
            List<string> participantInRoomIdentity = new();
            try
            {
                RoomServiceClient roomService = new RoomServiceClient(livekitServerUrl, apiKey, apiSecret);
                ListParticipantsRequest listParticipantRequest = new()
                {
                    Room = GenLiveRoomName(liveRoom)
                };
                ListParticipantsResponse participantInRoom = await roomService.ListParticipants(listParticipantRequest);
                participantInRoomIdentity = participantInRoom.Participants.Select(e => e.Identity).ToList();
            }
            catch (Exception e)
            {
                // Không có participant nào đang trong phòng
                return new();
            }

            Specification<Participant> participantSpec = new();
            participantSpec.Conditions.Add(e => e.LiveRoom.Id == liveRoomId && e.LivekitIdentity != null && participantInRoomIdentity.Contains(e.LivekitIdentity));
            participantSpec.Includes = q => q
                .Include(e => e.ClassMember).ThenInclude(cm => cm.User)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            List<Participant> participants = await _repository.GetListAsync(participantSpec);
            return _mapper.Map<List<ParticipantResponse>>(participants);
        }

        public async Task SendMessage(CreateLiveRoomMessageRequest request)
        {
            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(e => e.Id == request.LiveRoomId)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy phòng học!");

            Participant participant = await _repository.GetAsync<Participant>(
                e => e.Id == request.ParticipantId && e.LiveRoom.Id == request.LiveRoomId,
                includes: q => q
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.User)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                    .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem))
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy participant!");

            Message message = new Message
            {
                Content = request.Content,
                LiveRoom = liveRoom,
                SentBy = participant,
                CreatedAt = DateTime.UtcNow,
            };
            _repository.Add(message);
            await _repository.SaveChangesAsync();

            await _supabaseService.SendNewMessageBroadCastMessage(Utility.GenLiveRoomChannel(request.LiveRoomId), message);
        }

        public async Task<List<MessageResponse>> GetMessagesByLiveRoomId(long liveRoomId)
        {
            Specification<Message> spec = new();
            spec.Conditions.Add(e => e.LiveRoom.Id == liveRoomId);
            spec.Includes = q => q
                .Include(m => m.SentBy).ThenInclude(p => p.ClassMember).ThenInclude(cm => cm.User)
                .Include(m => m.SentBy).ThenInclude(p => p.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(m => m.SentBy).ThenInclude(p => p.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(m => m.SentBy).ThenInclude(p => p.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);
            spec.OrderBy = q => q.OrderBy(m => m.Id);

            List<Message> messages = await _repository.GetListAsync<Message>(spec);

            return _mapper.Map<List<MessageResponse>>(messages);
        }
        public async Task RemoveParticipantRequest(RemoveParticipantRequest request) // Dùng chung với chức năng leave room
        {
            Specification<Participant> spec = new();
            spec.Conditions.Add(e => e.Id == request.ParticipantId);
            spec.Includes = q => q
                .Include(e => e.ClassMember).ThenInclude(cm => cm.User)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Participant participant = await _repository.GetAsync<Participant>(spec) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy participant");

            LiveRoom liveRoom = await _repository.GetByIdAsync<LiveRoom>(request.LiveRoomId) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy live room");

            IConfigurationSection livekit = _configuration.GetSection("Livekit");
            string? apiKey = livekit["Key"];
            string? apiSecret = livekit["Secret"];
            string livekitServerUrl = livekit["ServerUrl"] ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy livekit server url! Kiểm tra appsetting.json");

            RoomServiceClient roomService = new RoomServiceClient(livekitServerUrl, apiKey, apiSecret);
            RoomParticipantIdentity removeRequest = new()
            {
                Room = GenLiveRoomName(liveRoom),
                Identity = participant.LivekitIdentity
            };

            try
            {
                await roomService.RemoveParticipant(removeRequest);

                if (!participant.LeaveAt.HasValue)
                {
                    participant.LeaveAt = DateTime.UtcNow;
                    _repository.Update(participant);
                    await _repository.SaveChangesAsync();
                    await _supabaseService.SendRoomNotificationsEvent(Utility.GenLiveRoomChannel(participant.LiveRoom.Id), RoomNotificationType.LeaveRoom, $"{participant.ClassMember.User.DisplayName} đã rời khỏi phòng");
                }
            }
            catch (Exception ex)
            {
                //throw new CustomException(ExceptionCode.InternalServerError, $"Xóa người tham gia thất bại");
            }
        }
        public async Task CreateRoomNotification(CreateRoomNotificationRequest request)
        {
            Specification<Participant> spec = new();
            spec.Conditions.Add(e => e.Id == request.ParticipantId);
            spec.Includes = q => q
                .Include(e => e.ClassMember).ThenInclude(cm => cm.User)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.AvatarFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.ChatFrameShopItem)
                .Include(e => e.ClassMember).ThenInclude(cm => cm.Cosmetics).ThenInclude(cosmetic => cosmetic.BadgeShopItem);

            Participant participant = await _repository.GetAsync<Participant>(spec) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy participant");


            if (request.Type == RoomNotificationType.StartShareScreen)
            {
                await _supabaseService.SendRoomNotificationsEvent(Utility.GenLiveRoomChannel(request.LiveRoomId), RoomNotificationType.StartShareScreen, $"{participant.ClassMember.User.DisplayName} đã bắt đầu chia sẻ màn hình");
            }

            if (request.Type == RoomNotificationType.StopShareScreen)
            {
                await _supabaseService.SendRoomNotificationsEvent(Utility.GenLiveRoomChannel(request.LiveRoomId), RoomNotificationType.StopShareScreen, $"{participant.ClassMember.User.DisplayName} đã dừng chia sẻ màn hình");
            }
        }

        public async Task<LiveRoomStatisticResponse> GetLiveRoomStatisticByLiveRoomId(int liveRoomId)
        {
            Specification<LiveRoom> liveRoomSpec = new();
            liveRoomSpec.Conditions.Add(e => e.Id == liveRoomId);
            liveRoomSpec.Includes = q => q.Include(e => e.Class).ThenInclude(e => e.Members).ThenInclude(cm => cm.User);
            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(liveRoomSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy live room", new ErrorDetail("Id", liveRoomId));

            LiveRoomStatisticResponse liveRoomStatistic = new();
            liveRoomStatistic.Id = liveRoom.Id;
            liveRoomStatistic.Title = liveRoom.Title;

            foreach (ClassMember classMember in liveRoom.Class.Members)
            {
                Specification<Participant> participantSpec = new();
                participantSpec.Conditions.Add(e => e.ClassMember.Id == classMember.Id && e.LiveRoom.Id == liveRoomId);
                participantSpec.OrderBy = q => q.OrderBy(e => e.Id);
                List<Participant> participants = await _repository.GetListAsync<Participant>(participantSpec);
                ParticipantAttendanceStatistic attendanceStatistic = new();

                attendanceStatistic.UserDisplayName = classMember.User.DisplayName;
                attendanceStatistic.UserId = classMember.User.Id;
                attendanceStatistic.TotalMinutes = Math.Round(participants.Where(p => p.LeaveAt.HasValue).Sum(p => (p.LeaveAt!.Value - p.JoinAt).TotalMinutes), 2);
                attendanceStatistic.AttendanceDetails = participants.OrderByDescending(p => p.Id).Select(p => new ParticipantAttendanceDetailStatistic()
                {
                    JoinAt = p.JoinAt,
                    LeaveAt = p.LeaveAt,
                }).ToList();

                liveRoomStatistic.Attendances.Add(attendanceStatistic);
            }


            liveRoomStatistic.Attendances = liveRoomStatistic.Attendances.OrderByDescending(e => e.TotalMinutes).ToList();
            return liveRoomStatistic;
        }

        public async Task EndLiveRoom(int liveRoomId)
        {
            User user = await _currentUserService.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông tin user");

            Specification<LiveRoom> liveRoomSpec = new();
            liveRoomSpec.Conditions.Add(e => e.Id == liveRoomId);
            liveRoomSpec.Includes = q => q.Include(e => e.Class).ThenInclude(c => c.Members).ThenInclude(m => m.User);

            LiveRoom liveRoom = await _repository.GetAsync<LiveRoom>(liveRoomSpec)
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy live room", new ErrorDetail("Id", liveRoomId));

            liveRoom.Status = LiveRoomStatus.Completed;
            _repository.Update(liveRoom);

            IConfigurationSection livekit = _configuration.GetSection("Livekit");
            string? apiKey = livekit["Key"];
            string? apiSecret = livekit["Secret"];
            string livekitServerUrl = livekit["ServerUrl"]
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy livekit server url! Kiểm tra appsetting.json");

            RoomServiceClient roomService = new RoomServiceClient(livekitServerUrl, apiKey, apiSecret);

            // Tìm tất cả participant đang tham gia phòng và cập nhật lại endTime
            // Thực chất đã có webhook xử lý
            ListParticipantsRequest listParticipantRequest = new()
            {
                Room = GenLiveRoomName(liveRoom)
            };
            ListParticipantsResponse participantInRoom = await roomService.ListParticipants(listParticipantRequest);
            List<string> participantInRoomIdentity = participantInRoom.Participants.Select(e => e.Identity).ToList();
            List<Participant> participants = await _repository.GetListAsync<Participant>(
                e => e.LiveRoom.Id == liveRoomId && e.LivekitIdentity != null && participantInRoomIdentity.Contains(e.LivekitIdentity));

            foreach (Participant p in participants)
            {
                p.LeaveAt = DateTime.UtcNow;
            }
            _repository.Update<Participant>(participants);
            await _repository.SaveChangesAsync();

            // Delete room in livekit service -> auto remove all participants in room
            DeleteRoomRequest request = new()
            {
                Room = GenLiveRoomName(liveRoom)
            };
            await roomService.DeleteRoom(request);

            CreateNotificationRequest notiRequest = new()
            {
                Type = "live_room_ended",
                Data = new Dictionary<string, string>
                {
                    ["roomTitle"] = liveRoom.Title,
                    ["className"] = liveRoom.Class.Name
                },
                SenderId = user.Id,
                ReceiverIds = liveRoom.Class.Members.Where(m => m.User.Id != user.Id).Select(m => m.User.Id).ToList(), // 
                LinkRedirect = $"/class/{liveRoom.Class.Id}/live-room",
                OpenNewTab = false,
                NeedSendEmail = false,
            };
            await _notificationService.CreateNotification(notiRequest);
        }
        // ***************** HELPER METHODS *************************

        //private string GenLiveRoomChannel(long liveRoomId)
        //{
        //    return $"LiveRoom-{liveRoomId}";
        //}
        private string GenParticipantIndentity(User user, Participant participant)
        {
            // Note: Idenity must be unique in room
            return $"User:{user.DisplayName}-UserId:{user.Id}-ParticipantId:{participant.Id}";
        }

        private string GenLiveRoomName(LiveRoom liveRoom)
        {
            return $"{liveRoom.Title}-{liveRoom.Id}";
        }
    }

}


