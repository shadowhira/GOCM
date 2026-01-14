namespace OnlineClassroomManagement.Helper.Options
{
    public class PasswordResetOptions
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string ProductionBaseUrl { get; set; } = string.Empty;
        public string Issuer { get; set; } = "OCM_Reset";
        public string Audience { get; set; } = "OCM_Reset_Client";
        public int TokenLifetimeMinutes { get; set; } = 30;
    }
}
