using OnlineClassroomManagement.Models.Responses.Classes;

namespace OnlineClassroomManagement.Models.Responses.Participants
{
    public class ParticipantResponse
    {
        public int Id { get; set; }
        public string LivekitIdentity { get; set; }
        public bool IsRaisingHand { get; set; }
        public ClassMemberResponse ClassMember { get; set; }
    }
}
