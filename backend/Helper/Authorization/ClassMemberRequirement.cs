using Microsoft.AspNetCore.Authorization;

namespace OnlineClassroomManagement.Helper.Authorization
{
    /// <summary>
    /// Requirement to ensure the current user is a member of the class targeted by the route.
    /// </summary>
    public sealed class ClassMemberRequirement : IAuthorizationRequirement
    {
    }
}