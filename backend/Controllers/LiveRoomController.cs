using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Requests.LiveRooms;
using OnlineClassroomManagement.Models.Responses.LiveRooms;
using OnlineClassroomManagement.Models.Responses.Messages;
using OnlineClassroomManagement.Models.Responses.Participants;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Controllers
{
    public class LiveRoomController : ApiControllerBase
    {
        private readonly ILiveRoomService _liveRoomService;
        public LiveRoomController(ILiveRoomService liveRoomServce)
        {
            _liveRoomService = liveRoomServce;
        }

        [HttpGet("All")]
        public async Task<List<LiveRoomResponse>> GetAllLiveRooms()
        {
            return await _liveRoomService.GetAllLiveRooms();
        }

        [HttpGet("List")]
        public async Task<PaginatedList<LiveRoomResponse>> GetList([FromQuery] GetPaginatedLiveRoomsRequest request)
        {
            return await _liveRoomService.GetListLiveRooms(request);
        }

        [HttpGet("{id}")]
        public async Task<LiveRoomResponse> GetLiveRoomById(int id)
        {
            return await _liveRoomService.GetLiveRoomById(id);
        }

        [HttpPost()]
        public async Task CreateLiveRoom(CreateLiveRoomRequest request)
        {
            await _liveRoomService.CreateLiveRoom(request);
        }

        [HttpPut()]
        public async Task UpdateLiveRoom(UpdateLiveRoomRequest request)
        {
            await _liveRoomService.UpdateLiveRooms(request);
        }

        [HttpDelete("{id}")]
        public async Task DeleteLiveRoom(int id)
        {
            await _liveRoomService.DeleteLiveRooms(id);
        }


        [HttpPost("join-room")]
        public async Task<JoinRoomResponse> JoinRoom(JoinRoomRequest request)
        {
            return await _liveRoomService.JoinRoom(request);
        }

        [HttpPut("raise-hand")]
        public async Task RaiseHand(UpdatePartipantRaiseHandRequest request)
        {
            await _liveRoomService.RaiseHand(request);
        }

        [HttpGet("{id}/Participants")]
        public async Task<List<ParticipantResponse>> GetParticipantsByRoomId(int id)
        {
            return await _liveRoomService.GetParticipantsByRoomId(id);
        }

        [HttpGet("{id}/Messages")]
        public async Task<List<MessageResponse>> GetMessagesByRoomId(int id)
        {
            return await _liveRoomService.GetMessagesByLiveRoomId(id);
        }

        [HttpPost("send-message")]
        public async Task SendMessage(CreateLiveRoomMessageRequest request)
        {
            await _liveRoomService.SendMessage(request);
        }

        [HttpPost("remove-participant")]
        public async Task RemoveParticipant(RemoveParticipantRequest request)
        {
            await _liveRoomService.RemoveParticipantRequest(request);
        }

        //[HttpPost("leave-room")]
        //public async Task LeaveRoom()
        [HttpPost("create-room-notification")]
        public async Task CreateRoomNotification(CreateRoomNotificationRequest request)
        {
            await _liveRoomService.CreateRoomNotification(request);
        }


        [HttpGet("{id}/statistic")]
        public async Task<LiveRoomStatisticResponse> GetLiveRoomStatisticByLiveRoomId(int id)
        {
            return await _liveRoomService.GetLiveRoomStatisticByLiveRoomId(id);
        }

        [HttpPost("{id}/end-live-room")]
        public async Task EndLiveRoom(int id)
        {
            await _liveRoomService.EndLiveRoom(id);
        }
    }
}
