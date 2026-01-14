using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Helper.Constants;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Helper.Authorization
{
    /// <summary>
    /// Authorization handler to verify the current user belongs to the class referenced in the route.
    /// Admin users are allowed access to all classes.
    /// </summary>
    public sealed class ClassMemberAuthorizationHandler : AuthorizationHandler<ClassMemberRequirement>
    {
        private readonly IRepository _repository;
        private readonly ILogger<ClassMemberAuthorizationHandler> _logger;

        public ClassMemberAuthorizationHandler(IRepository repository, ILogger<ClassMemberAuthorizationHandler> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            ClassMemberRequirement requirement)
        {
            if (context.Resource is not HttpContext httpContext)
            {
                context.Succeed(requirement);
                return;
            }

            int? userId = ResolveUserId(httpContext.User);
            if (!userId.HasValue)
            {
                _logger.LogWarning("Class member check failed: missing user id claim");
                return;
            }

            // Allow Admin users to access all classes
            if (context.User.IsInRole(Role.Admin.ToString()))
            {
                context.Succeed(requirement);
                return;
            }

            int? classId = ResolveClassId(httpContext.GetRouteData());

            // If the endpoint does not contain a class identifier, treat as not applicable.
            if (!classId.HasValue)
            {
                context.Succeed(requirement);
                return;
            }

            bool isMember = await _repository.GetQueryable<ClassMember>()
                .AnyAsync(cm => cm.User.Id == userId.Value && cm.Class.Id == classId.Value);

            if (isMember)
            {
                context.Succeed(requirement);
                return;
            }

            _logger.LogWarning(
                "Class member check failed for user {UserId} on class {ClassId}",
                userId.Value,
                classId.Value);
        }

        private static int? ResolveUserId(ClaimsPrincipal user)
        {
            string? idValue = user.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? user.FindFirstValue(ClaimTypes.Name)
                ?? user.FindFirstValue(ClaimTypes.Sid)
                ?? user.FindFirstValue("sub");

            return int.TryParse(idValue, out int parsed) ? parsed : null;
        }

        private static int? ResolveClassId(RouteData? routeData)
        {
            if (routeData == null)
            {
                return null;
            }

            // Normalize keys to lowercase for case-insensitive lookups.
            Dictionary<string, object?> values = routeData.Values.ToDictionary(
                kvp => kvp.Key.ToLowerInvariant(),
                kvp => kvp.Value);

            // Common parameter names used across controllers.
            string[] candidateKeys = new[] { "classid", "class_id", "class" };

            foreach (string key in candidateKeys)
            {
                if (values.TryGetValue(key, out object? raw) && raw != null)
                {
                    if (int.TryParse(raw.ToString(), out int classId))
                    {
                        return classId;
                    }
                }
            }

            // Fallback for ClassController where route parameter is often "id".
            if (values.TryGetValue("id", out object? idRaw) && idRaw != null)
            {
                if (int.TryParse(idRaw.ToString(), out int classId))
                {
                    // Only treat "id" as class id when the controller name is Class.
                    string? controllerName = values.TryGetValue("controller", out object? controllerRaw)
                        ? controllerRaw?.ToString()
                        : null;

                    if (!string.IsNullOrWhiteSpace(controllerName) &&
                        controllerName.Equals("class", StringComparison.OrdinalIgnoreCase))
                    {
                        return classId;
                    }
                }
            }

            return null;
        }
    }
}