using OnlineClassroomManagement.Helper.Constants;

namespace OnlineClassroomManagement.Models.Entities
{
    public class LiveRoom
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public DateTime ScheduledStartAt { get; set; }
        public DateTime ScheduledEndAt { get; set; }
        public ClassMember CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        //public List<Participant> Participants { get; set; } = new();
        //public List<Message> Messages { get; set; } = new();
        public LiveRoomStatus Status { get; set; }
        public Class Class { get; set; }
    }
}
