namespace OnlineClassroomManagement.Models.Entities
{
    public class ClassAppearanceSettings
    {
        public int ClassId { get; set; }
        public Class Class { get; set; }
        public bool ShowAvatarFrames { get; set; } = true;
        public bool ShowChatFrames { get; set; } = true;
        public bool ShowBadges { get; set; } = true;
        public DateTime UpdatedAt { get; set; }
    }
}
