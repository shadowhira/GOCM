namespace OnlineClassroomManagement.Helper.Constants
{
    public enum Role
    {
        Admin = 0,
        User = 1
    }

    public static class RoleExtension
    {
        public static readonly List<string> RoleTextValues = new List<string>()
        {
            "Admin",
            "User",
        };

        public static string GetText(this Role role)
        {
            try
            {
                return RoleTextValues[(int)role];
            }
            catch (Exception ex)
            {
                return "n/a";
            }
        }
    }

    public enum RoleInClass
    {
        Teacher = 0,
        Student = 1
    }

    public static class RoleInClassExtension
    {
        public static readonly List<string> RoleInClassTextValues = new List<string>()
        {
            "Teacher",
            "Student",
        };

        public static string GetText(this RoleInClass roleInClass)
        {
            try
            {
                return RoleInClassTextValues[(int)roleInClass];
            }
            catch (Exception)
            {
                return "n/a";
            }
        }
    }

    public enum AssignmentStatus
    {
        Assigned = 0,
        Expired = 1,
    }

    public enum AssignmentType
    {
        Essay = 0,
        Quiz = 1,
        Group = 2,
    }

    public enum AssignmentGroupStatus
    {
        PendingApproval = 0,
        Approved = 1,
        Rejected = 2,
        Draft = 3
    }

    public enum AssignmentGroupInvitationStatus
    {
        Pending = 0,
        Accepted = 1,
        Rejected = 2
    }

    public enum AssignmentGroupApprovalStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

    public enum ShopItemVisualType
    {
        AvatarFrame = 0,
        ChatFrame = 1,
        NameBadge = 2
    }

    public enum ShopItemTier
    {
        Basic = 0,
        Advanced = 1,
        Elite = 2,
        Legendary = 3
    }

    public enum CosmeticSlot
    {
        AvatarFrame = 0,
        ChatFrame = 1,
        Badge = 2
    }

    public enum SubmissionStatus
    {
        NotSubmitted = 0,
        Submitted = 1,
        Graded = 2,
    }

    public enum QuestionType
    {
        SingleChoice = 0,
        MultipleChoice = 1,
    }

    public enum FileType
    {
        Pdf = 0,
        Word = 1,        // .doc, .docx
        Excel = 2,       // .xls, .xlsx
        PowerPoint = 3,  // .ppt, .pptx
        Image = 4,       // .jpg, .png, .jpeg, .gif
        Video = 5,       // .mp4, .mov, .avi
        Audio = 6,       // .mp3, .wav, .ogg
        Text = 7,        // .txt, .csv
        Zip = 8,         // .zip, .rar, .7z
        Other = 9        // các định dạng khác
    }

    public enum PostStatus
    {

    }


    public enum ActivityType
    {
        PostContribution = 0,
        CommentContribution = 1,
        InitialLiveRoomJoin = 2,
        ManualPenalty = 3,
        LiveRoomQuickBonus = 4,
        OnTimeSubmission = 5,
        HighGrade = 6
    }

    public enum ParentType
    {
        Assignment = 0,
        Post = 1,
        Comment = 2,
        Submission = 3,
        LiveRoom = 4
    }

    public enum SourceType
    {

    }

    public static class Buckets
    {
        public const string Documents = "documents";
        public const string Avatars = "avatars";
        public const string ShopItems = "shopitems";
        public const string ClassCovers = "class-covers";
    }

    public enum LiveRoomStatus
    {
        NotStarted = 0,
        InProgress = 1,
        Completed = 2
    }

    public static class LiveRoomStatusExtension
    {
        public static readonly List<string> LiveRoomStatusTextValues = new List<string>()
        {
            "Chưa bắt đầu",
            "Đang diễn ra",
            "Đã kết thúc"
        };

        public static string GetText(this LiveRoomStatus roleInClass)
        {
            try
            {
                return LiveRoomStatusTextValues[(int)roleInClass];
            }
            catch (Exception)
            {
                return "n/a";
            }
        }
    }

    public enum RoomNotificationType
    {
        JoinRoom = 0,
        LeaveRoom = 1,
        RaiseHand = 2,
        StartShareScreen = 3,
        StopShareScreen = 4
    }

    public enum NotificationStatus
    {
        New,
        Read,
    }

    public static class OCM_RealtimeChannels
    {
        public const string Common = "common";
    }

    public static class OCM_ChannelEventNames
    {
        public const string ParticipantRaiseHandUpdated = "participant_raise_hand_updated";
        public const string NewMessage = "new_message";
        public const string ParticipantJoinRoom = "participant_join_room";
        public const string RoomNotification = "room_notification";
        public const string LiveRoomRewardGranted = "live_room_reward_granted";
        public const string SystemNotification = "system_notification";
    }
}
