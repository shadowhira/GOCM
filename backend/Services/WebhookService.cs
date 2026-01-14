using Livekit.Server.Sdk.Dotnet;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Controllers;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Helper.Utilities;
using OnlineClassroomManagement.Models.Entities;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{

    public interface IWebhookService
    {
        Task WebhookEventHandler(WebhookEvent webhookEvent);
    }
    public class WebhookService : IWebhookService
    {
        private readonly ILogger<WebhookController> _logger;
        private readonly IRepository _repository;
        private readonly ISupabaseService _supabaseService;

        public WebhookService(ILogger<WebhookController> logger, IRepository repository, ISupabaseService supabaseService)
        {
            _logger = logger;
            _repository = repository;
            _supabaseService = supabaseService;
        }
        public async Task WebhookEventHandler(WebhookEvent webhookEvent)
        {
            switch (webhookEvent.Event)
            {
                //case "room_started":
                //    _logger.LogInformation($"Room started: {webhookEvent.Room?.Name}");
                //    break;

                //case "room_finished":
                //    _logger.LogInformation($"Room finished: {webhookEvent.Room?.Name}");
                //    break;

                //case "participant_joined":
                //    _logger.LogInformation($"Participant joined: {webhookEvent.Participant?.Identity}");
                //    // TODO: Cập nhật danh sách người tham gia
                //    break;

                case "participant_left":
                    _logger.LogInformation($"Participant left: {webhookEvent.Participant?.Identity}");
                    await LeftRoomEventHandler(webhookEvent);

                    break;

                //case "track_published":
                //    _logger.LogInformation($"Track published by {webhookEvent.Participant?.Identity}");
                //    break;

                //case "track_unpublished":
                //    _logger.LogInformation($"Track unpublished by {webhookEvent.Participant?.Identity}");
                //    break;

                //case "egress_started":
                //case "egress_ended":
                //    _logger.LogInformation($"Egress event: {webhookEvent.Event}");
                //    // TODO: Xử lý recording
                //    break;

                default:
                    _logger.LogWarning($"Unhandled event type: {webhookEvent.Event}");
                    break;
            }
        }

        private async Task LeftRoomEventHandler(WebhookEvent webhookEvent)
        {
            string? participantIdString = webhookEvent.Participant?.Attributes.GetValueOrDefault("ParticipantId") ?? null;
            if (participantIdString != null && int.TryParse(participantIdString, out int participantId))
            {
                Specification<Participant> spec = new();
                spec.Conditions.Add(e => e.Id == participantId);
                spec.Includes = q => q.Include(e => e.LiveRoom)
                                       .Include(e => e.ClassMember).ThenInclude(cm => cm.User);

                Participant participant = await _repository.GetAsync(spec);

                if (!participant.LeaveAt.HasValue)
                {
                    participant.LeaveAt = DateTime.UtcNow;
                    _repository.Update(participant);
                    await _repository.SaveChangesAsync();
                    await _supabaseService.SendRoomNotificationsEvent(Utility.GenLiveRoomChannel(participant.LiveRoom.Id), RoomNotificationType.LeaveRoom, $"{participant.ClassMember.User.DisplayName} đã rời khỏi phòng");
                }

            }
            else
            {
                _logger.LogWarning($"Invalid ParticipantId attribute: {participantIdString}");
            }
        }
    }
}
