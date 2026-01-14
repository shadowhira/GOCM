namespace OnlineClassroomManagement.Models.Responses.LiveRooms
{
    public class LiveRoomStatisticResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } // Room.Title
        public List<ParticipantAttendanceStatistic> Attendances { get; set; } = new List<ParticipantAttendanceStatistic>();
    }

    public class ParticipantAttendanceStatistic
    {
        public int UserId { get; set; }
        public string UserDisplayName { get; set; }
        public double TotalMinutes { get; set; }
        public List<ParticipantAttendanceDetailStatistic> AttendanceDetails { get; set; } = new();
    }

    public class ParticipantAttendanceDetailStatistic
    {
        public DateTime JoinAt { get; set; }
        public DateTime? LeaveAt { get; set; } // Nullable vì có thể xảy ra TH không xác định mà khiến cho hệ thống k lưu được leaveAt
        // Note: 
        // TH: Click nút leave room -> Đã xử lý
        // TH: Tắt trình duyệt, tắt máy, ... -> Đã xử lý thông qua webhook gửi từ livekit server tới BE (Tuy nhiên test trên local cần tool hỗ trợ tunneling), deploy thì cần đky webhook
    }
}
