using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Assignments;
using OnlineClassroomManagement.Models.Responses.Assignments;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class AssignmentController : ApiControllerBase
    {
        private readonly IAssignmentService _assignmentService;

        public AssignmentController(IAssignmentService assignmentService)
        {
            _assignmentService = assignmentService;
        }

        // Tạo assignment trong class
        [HttpPost("classes/{classId}")]
        public async Task<AssignmentDetailResponse> CreateAssignment(
            int classId,
            [FromBody] CreateAssignmentRequest request)
        {
            AssignmentDetailResponse response = await _assignmentService.CreateAssignment(request, classId);
            return response;
        }

        // Lấy tất cả assignments
        [HttpGet("All")]
        public async Task<List<AssignmentResponse>> GetAllAssignments()
        {
            return await _assignmentService.GetAllAssignments();
        }

        // Lấy danh sách assignments được phân trang
        [HttpGet("assignments")]
        public async Task<PaginatedList<AssignmentResponse>> GetListAssignments([FromQuery] GetPaginatedAssignmentsRequest request)
        {
            return await _assignmentService.GetListAssignments(request);
        }

        // Lấy assignment theo Id
        [HttpGet("{id}")]
        public async Task<AssignmentResponse> GetAssignmentById(int id)
        {
            AssignmentResponse assignment = await _assignmentService.GetAssignmentById(id);
            return assignment;
        }

        // Lấy danh sách tất cả assignment trong 1 class
        [HttpGet("classes/{classId}/All")]
        public async Task<List<AssignmentResponse>> GetAllAssignmentsByClassId(int classId)
        {
            return await _assignmentService.GetAllAssignmentsByClassId(classId);
        }

        // Lấy danh sách assignment trong 1 class có phân trang
        [HttpGet("classes/{classId}/assignments")]
        public async Task<PaginatedList<AssignmentResponse>> GetListAssignmentsByClassId(int classId,[FromQuery] GetPaginatedAssignmentsRequest request)
        {
            return await _assignmentService.GetListAssignmentsByClassId(classId, request);
        }

        // Lấy danh sách assignment nhóm trong 1 class
        [HttpGet("classes/{classId}/assignments/group")]
        public async Task<List<AssignmentResponse>> GetGroupAssignmentsByClassId(int classId)
        {
            return await _assignmentService.GetGroupAssignmentsByClassId(classId);
        }
        
        // Lấy assignment với đầy đủ thông tin (bao gồm đáp án đúng) - Chỉ dành cho teacher
        [HttpGet("classes/{classId}/assignments/{assignmentId}/full")]
        public async Task<AssignmentDetailResponse> GetAssignmentWithAnswersForTeacher(int classId, int assignmentId)
        {
            return await _assignmentService.GetAssignmentWithAnswersForTeacher(assignmentId, classId);
        }

        [HttpGet("classes/{classId}/assignments/unsubmitted/count")]
        public async Task<AssignmentUnsubmittedCountResponse> GetCountAssignmentUnsubmittedByUserInClass(int classId)
        {
            return await _assignmentService.GetCountAssignmentUnsubmittedByUserInClass(classId);
        }

        // Update assignment
        [HttpPut("classes/{classId}/assignments/{assignmentId}")]
        public async Task<AssignmentDetailResponse> UpdateAssignment(
            int classId,
            int assignmentId,
            [FromBody] UpdateAssignmentRequest request)
        {
            AssignmentDetailResponse response = await _assignmentService.UpdateAssignment(classId, assignmentId, request);
            return response;
        }

        [HttpPut("{assignmentId}/allow-show-result-to-student")]
        public async Task AllowShowResultToStudent(int assignmentId, [FromBody] AllowShowResultToStudentRequest request)
        {
            await _assignmentService.AllowShowResultToStudent(assignmentId, request);
        }

        [HttpDelete("{assignmentId}")]
        public async Task DeleteAssignment(int assignmentId)
        {
            await _assignmentService.DeleteAssignment(assignmentId);
        }

        [Consumes("multipart/form-data")]
        [HttpPost("classes/{classId}/excel")]
        public async Task<AssignmentDetailResponse> CreateAssignmentFromExcel(
            int classId,
            [FromForm] CreateAssignmentFromExcelRequest request)
        {
            AssignmentDetailResponse response = await _assignmentService.CreateAssignmentFromExcel(request, classId);
            return response;
        }
    }
}