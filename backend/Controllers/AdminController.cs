using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Responses.Admin;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireAdmin)]
    public class AdminController : ApiControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // GET api/Admin/Overview
        [HttpGet("Overview")]
        public async Task<AdminOverviewResponse> GetAdminOverview()
        {
            return await _adminService.GetAdminOverview();
        }
    }
}
