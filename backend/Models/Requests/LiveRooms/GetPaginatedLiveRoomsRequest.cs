using OnlineClassroomManagement.Helper.BaseModel;

namespace OnlineClassroomManagement.Models.Requests.LiveRooms
{
    public class GetPaginatedLiveRoomsRequest : BasePaginatedRequest
    {
        public long? ClassId { get; set; }
    }
}
