namespace OnlineClassroomManagement.Helper.Utilities
{
    public static class Utility
    {
        public static string GenLiveRoomChannel(long liveRoomId)
        {
            return $"LiveRoom-{liveRoomId}";
        }
    }
}
