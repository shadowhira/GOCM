namespace OnlineClassroomManagement.Helper.Authorization
{
    /// <summary>
    /// Central place to keep authorization policy names.
    /// </summary>
    public static class AuthorizationPolicies
    {
        public const string RequireAdmin = "RequireAdmin";
        public const string RequireClassMember = "RequireClassMember";
    }
}