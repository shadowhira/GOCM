namespace OnlineClassroomManagement.Models.Entities
{
    public class Participant
    {
        public int Id { get; set; }
        public string? LivekitIdentity { get; set; }
        public bool IsRaisingHand { get; set; }
        public LiveRoom LiveRoom { get; set; }
        public ClassMember ClassMember { get; set; }
        public DateTime JoinAt { get; set; }
        public DateTime? LeaveAt { get; set; }
        //public List<ParticipantLog> ParticipantLogs { get; set; } = new();
    }
}
