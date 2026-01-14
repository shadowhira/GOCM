using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.LiveRooms;
using OnlineClassroomManagement.Models.Requests.Users;
using OnlineClassroomManagement.Models.Responses.LiveRooms;
using OnlineClassroomManagement.Models.Responses.Messages;
using OnlineClassroomManagement.Models.Responses.Notifications;
using OnlineClassroomManagement.Models.Responses.Participants;
using OnlineClassroomManagement.Models.Responses.Rewards;
using OnlineClassroomManagement.Models.Responses.Users;
using System.Text.Json;

namespace OnlineClassroomManagement.Helper.MappingProfile
{
    public class MappingProfile : Profile
    {
        private static string NormalizeNotificationType(string? type)
        {
            return string.IsNullOrWhiteSpace(type) ? "legacy" : type.Trim();
        }

        private static string SerializeNotificationData(Dictionary<string, string>? data)
        {
            return JsonSerializer.Serialize(data ?? new Dictionary<string, string>());
        }

        private static Dictionary<string, string> DeserializeNotificationData(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new Dictionary<string, string>();
            }

            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new Dictionary<string, string>();
            }
            catch
            {
                return new Dictionary<string, string>();
            }
        }

        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserResponse>();
            CreateMap<CreateUserRequest, User>();
            CreateMap<UpdateUserRequest, User>();

            // LiveRoom Mappings
            CreateMap<CreateLiveRoomRequest, LiveRoom>();
            CreateMap<UpdateLiveRoomRequest, LiveRoom>();
            CreateMap<LiveRoom, LiveRoomResponse>()
                .ForMember(dest => dest.ClassId, opt => opt.MapFrom(src => src.Class.Id));
            CreateMap<Participant, ParticipantResponse>();
            CreateMap<Message, MessageResponse>()
                .ForMember(dest => dest.DisplayName, opt => opt.MapFrom(src => src.SentBy != null ? src.SentBy.ClassMember.User.DisplayName : "Hệ thống"));

            CreateMap<RewardActivity, RewardActivityResponse>()
                .ForMember(dest => dest.ClassId, opt => opt.MapFrom(src => src.Class.Id))
                .ForMember(dest => dest.TargetUserId, opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.TargetUserName, opt => opt.MapFrom(src => src.User.DisplayName))
                .ForMember(dest => dest.Points, opt => opt.MapFrom(src => src.TotalEarnedPoints));


            CreateMap<CreateNotificationRequest, Notification>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => NormalizeNotificationType(src.Type)))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => SerializeNotificationData(src.Data)));
            CreateMap<Notification, NotificationResponse>()
                .ForMember(dest => dest.SenderName, opt => opt.MapFrom(src => src.Sender != null ? src.Sender.DisplayName : "Hệ thống"))
                .ForMember(dest => dest.SenderAvatarUrl, opt => opt.MapFrom(src => src.Sender != null ? src.Sender.AvatarUrl : ""))
                .ForMember(dest => dest.IsRead, opt => opt.MapFrom(src => src.Status == OnlineClassroomManagement.Helper.Constants.NotificationStatus.Read))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => NormalizeNotificationType(src.Type)))
                .ForMember(dest => dest.Data, opt => opt.MapFrom(src => DeserializeNotificationData(src.Data)));
        }
    }
}
