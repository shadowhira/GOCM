using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Broadcast;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.Notifications;
using OnlineClassroomManagement.Models.Responses.Notifications;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface INotificationService
    {
        Task CreateNotification(CreateNotificationRequest request);
        Task<List<NotificationResponse>> GetTopNotifications(GetTopNotificationsRequest request);
        Task MarkNotificationAsReaded(int id);
        Task MarkNotificationAsUnread(int id);
        Task HideNotification(int id);
        Task MarkAllNotificationsAsReaded();
        Task<PaginatedList<NotificationResponse>> GetListNotification(GetListNotificationRequest request);
    }

    public class NotificationService : INotificationService
    {
        private readonly ISupabaseService _supbaseService;
        private readonly IMapper _mapper;
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUser;
        private readonly IEmailService _emailService;
        public NotificationService(ISupabaseService supabaseService, IMapper mapper, IRepository repository,
            ICurrentUserService currentUser, IEmailService emailService)
        {
            _supbaseService = supabaseService;
            _mapper = mapper;
            _repository = repository;
            _currentUser = currentUser;
            _emailService = emailService;
        }
        public async Task CreateNotification(CreateNotificationRequest request)
        {
            User? sender = null;
            List<User> receivers = await _repository.GetListAsync<User>(e => request.ReceiverIds.Contains(e.Id));

            if (!receivers.Any())
                return; // Không có | Không tìm thấy người nhận 

            if (request.SenderId.HasValue)
                sender = await _repository.GetByIdAsync<User>(request.SenderId.Value);

            List<Notification> notifications = receivers.Select(receiver =>
            {
                Notification notification = _mapper.Map<Notification>(request);
                notification.CreatedAt = DateTime.UtcNow;
                notification.Sender = sender;
                notification.Receiver = receiver;
                notification.Status = NotificationStatus.New;

                // Defensive normalization (in case request.Type/Data not provided)
                if (string.IsNullOrWhiteSpace(notification.Type))
                {
                    notification.Type = "legacy";
                }
                if (string.IsNullOrWhiteSpace(notification.Data))
                {
                    notification.Data = "{}";
                }

                return notification;
            }).ToList();

            await _repository.AddAsync<Notification>(notifications);
            await _repository.SaveChangesAsync();

            SystemNotificationBroadcast broadcastPayload = new SystemNotificationBroadcast
            {
                ReceiverIds = request.ReceiverIds,
                Type = string.IsNullOrWhiteSpace(request.Type) ? "legacy" : request.Type.Trim(),
                Data = request.Data ?? new Dictionary<string, string>()
            };
            _supbaseService.SendSystemNotificationEvent(broadcastPayload);

            // Send emails
            if (request.NeedSendEmail)
            {
                _emailService.SendEmail2MultipleRecipients(
                    request.MailTitle ?? "Undefined title",
                    request.MailHtmlContent ?? "Undefined content",
                    receivers.Select(e => e.Email).ToList());
            }
        }

        public async Task<List<NotificationResponse>> GetTopNotifications(GetTopNotificationsRequest request)
        {
            User currentUser = await _currentUser.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user đăng nhập");

            Specification<Notification> spec = new();
            spec.Conditions.Add(e => e.Receiver.Id == currentUser.Id);
            spec.OrderBy = q => q.OrderByDescending(e => e.Id);
            spec.Includes = q => q.Include(e => e.Sender);
            spec.Take = request.Top;

            List<Notification> notifications = await _repository.GetListAsync(spec);
            return _mapper.Map<List<NotificationResponse>>(notifications);
        }

        public async Task MarkNotificationAsReaded(int id)
        {
            Notification noti = await _repository.GetByIdAsync<Notification>(id) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông báo");
            noti.Status = NotificationStatus.Read;

            _repository.Update(noti);
            await _repository.SaveChangesAsync();
        }

        public async Task MarkNotificationAsUnread(int id)
        {
            Notification noti = await _repository.GetByIdAsync<Notification>(id) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông báo");
            noti.Status = NotificationStatus.New;

            _repository.Update(noti);
            await _repository.SaveChangesAsync();
        }

        public async Task HideNotification(int id)
        {
            Notification noti = await _repository.GetByIdAsync<Notification>(id) ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy thông báo");
            _repository.Remove(noti);
            await _repository.SaveChangesAsync();
        }

        public async Task MarkAllNotificationsAsReaded()
        {
            User currentUser = await _currentUser.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user đăng nhập");

            Specification<Notification> spec = new();
            spec.Conditions.Add(e => e.Receiver.Id == currentUser.Id && e.Status == NotificationStatus.New);

            List<Notification> notifications = await _repository.GetListAsync(spec);
            foreach (Notification noti in notifications)
                noti.Status = NotificationStatus.Read;

            _repository.Update<Notification>(notifications);
            await _repository.SaveChangesAsync();
        }

        public async Task<PaginatedList<NotificationResponse>> GetListNotification(GetListNotificationRequest request)
        {
            User currentUser = await _currentUser.GetCurrentUserInfo()
                ?? throw new CustomException(ExceptionCode.NotFound, "Không tìm thấy user đăng nhập");

            PaginationSpecification<Notification> spec = new();
            spec.Conditions.Add(e => e.Receiver.Id == currentUser.Id);


            //if (!string.IsNullOrEmpty(request.Keyword))
            //{
            //    string kw = request.Keyword.Trim().ToLower();
            //    spec.Conditions.Add(e =>
            //        (!string.IsNullOrEmpty(e.Type) && e.Type.Trim().ToLower().Contains(kw))
            //        || (!string.IsNullOrEmpty(e.Data) && e.Data.Trim().ToLower().Contains(kw)));
            //}

            if (request.Status.HasValue)
            {
                spec.Conditions.Add(e => e.Status == request.Status.Value);
            }

            if (request.StartDate.HasValue)
            {
                spec.Conditions.Add(e => e.CreatedAt >= request.StartDate.Value);
            }

            if (request.EndDate.HasValue)
            {
                spec.Conditions.Add(e => e.CreatedAt < request.EndDate.Value.AddDays(1));
            }

            spec.Includes = q => q.Include(e => e.Sender);
            spec.PageSize = request.PageSize;
            spec.PageIndex = request.PageNumber;
            spec.OrderBy = q => q.OrderByDescending(e => e.Id);

            PaginatedList<NotificationResponse> res = await _repository.GetListAsync<Notification, NotificationResponse>(spec, e => _mapper.Map<NotificationResponse>(e));

            return res;
        }
    }
}
