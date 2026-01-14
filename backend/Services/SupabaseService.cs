using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Broadcast;
using OnlineClassroomManagement.Models.Broadct;
using OnlineClassroomManagement.Models.Entities;
using Supabase.Realtime;
using System.Collections.Concurrent;
using static Supabase.Realtime.Constants;

namespace OnlineClassroomManagement.Services
{
    public interface ISupabaseService
    {
        Task SendParticipantRaiseHandBroadCastMessage(string liveRoomChannel, Participant participant);
        Task SendNewMessageBroadCastMessage(string liveRoomChannel, Message message);
        Task SendParticipantJoinRoomEvent(string liveRoomChannel, Participant participant);
        Task SendRoomNotificationsEvent(string liveRoomChannel, RoomNotificationType type, string notifcation);
        Task SendLiveRoomRewardEvent(string liveRoomChannel, LiveRoomRewardBroadcast payload);
        Task SendSystemNotificationEvent(SystemNotificationBroadcast payload);
    }
    public class SupabaseService : ISupabaseService
    {
        private bool _isConnected = false;
        private readonly Supabase.Client _supabase;

        // Cache channels và broadcasts
        private readonly ConcurrentDictionary<string, RealtimeChannel> _channels = new();

        public SupabaseService(Supabase.Client supabase)
        {
            _supabase = supabase;
        }

        public async Task EnsureConnectedAsync()
        {
            if (!_isConnected)
            {
                await _supabase.InitializeAsync();
                await _supabase.Realtime.ConnectAsync();
                _isConnected = true;
            }
        }

        public async Task SendParticipantRaiseHandBroadCastMessage(string liveRoomChannel, Participant participant)
        {
            await EnsureConnectedAsync();

            ParticipantRaiseHandBroadcast payload = new()
            {
                ParticipantId = participant.Id,
                ParticipantIdentity = participant.LivekitIdentity ?? "undefined",
                IsRaisingHand = participant.IsRaisingHand
            };

            BroadcastMessage<ParticipantRaiseHandBroadcast> message = new()
            {
                Event = OCM_ChannelEventNames.ParticipantRaiseHandUpdated,
                Payload = payload
            };


            RealtimeChannel channel = _channels.GetOrAdd(liveRoomChannel, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }
            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", message);
            //channel.Push(
            //    eventName: ChannelEventName.Broadcast,
            //    type: "object",
            //    payload: payload
            //);
        }

        public async Task SendNewMessageBroadCastMessage(string liveRoomChannel, Message message)
        {
            await EnsureConnectedAsync();

            MessageBroadcast payload = new()
            {
                Id = message.Id,
                DisplayName = message.SentBy?.ClassMember.User.DisplayName ?? "Hệ thống",
                Content = message.Content,
                CreatedAt = message.CreatedAt,
            };

            BroadcastMessage<MessageBroadcast> broadcastMessage = new()
            {
                Event = OCM_ChannelEventNames.NewMessage,
                Payload = payload
            };

            RealtimeChannel channel = _channels.GetOrAdd(liveRoomChannel, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }

            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", broadcastMessage);
        }

        public void UnsubscribeChannel(string liveRoomChannel)
        {
            if (_channels.TryRemove(liveRoomChannel, out var channel))
            {
                channel.Unsubscribe();
                //_broadcasts.TryRemove(liveRoomChannel, out _);
            }
        }

        public async Task SendParticipantJoinRoomEvent(string liveRoomChannel, Participant participant)
        {
            await EnsureConnectedAsync();

            ParticipantJoinRoomBroadcast payload = new()
            {
                ParticipantId = participant.Id,
                ParticipantIdentity = participant.LivekitIdentity ?? "",
            };

            BroadcastMessage<ParticipantJoinRoomBroadcast> broadcastMessage = new()
            {
                Event = OCM_ChannelEventNames.ParticipantJoinRoom,
                Payload = payload
            };

            RealtimeChannel channel = _channels.GetOrAdd(liveRoomChannel, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }

            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", broadcastMessage);
        }

        public async Task SendRoomNotificationsEvent(string liveRoomChannel, RoomNotificationType type, string notifcation)
        {
            await EnsureConnectedAsync();

            RoomNotificationBroadcast payload = new()
            {
                Id = Guid.NewGuid().ToString(),
                Type = type,
                Notification = notifcation,
                CreatedAt = DateTime.UtcNow
            };

            BroadcastMessage<RoomNotificationBroadcast> broadcastMessage = new()
            {
                Event = OCM_ChannelEventNames.RoomNotification,
                Payload = payload
            };

            RealtimeChannel channel = _channels.GetOrAdd(liveRoomChannel, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }

            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", broadcastMessage);
        }

        public async Task SendLiveRoomRewardEvent(string liveRoomChannel, LiveRoomRewardBroadcast payload)
        {
            await EnsureConnectedAsync();

            BroadcastMessage<LiveRoomRewardBroadcast> broadcastMessage = new()
            {
                Event = OCM_ChannelEventNames.LiveRoomRewardGranted,
                Payload = payload
            };

            RealtimeChannel channel = _channels.GetOrAdd(liveRoomChannel, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }

            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", broadcastMessage);
        }

        public async Task SendSystemNotificationEvent(SystemNotificationBroadcast payload)
        {
            await EnsureConnectedAsync();

            BroadcastMessage<SystemNotificationBroadcast> broadcastMessage = new()
            {
                Event = OCM_ChannelEventNames.SystemNotification,
                Payload = payload
            };

            RealtimeChannel channel = _channels.GetOrAdd(OCM_RealtimeChannels.Common, channelName =>
            {
                return _supabase.Realtime.Channel(channelName);
            });

            if (channel.State != ChannelState.Joined)
            {
                await channel.Subscribe();
            }

            // bug using await: https://github.com/supabase-community/realtime-csharp/issues/38
            _ = channel.Send(ChannelEventName.Broadcast, "object", broadcastMessage);
        }
    }
}
