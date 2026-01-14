using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Grades;
using OnlineClassroomManagement.Models.Requests.Submissions;
using OnlineClassroomManagement.Models.Responses.Grades;
using OnlineClassroomManagement.Models.Responses.Submissions;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class SubmissionController : ApiControllerBase
    {
        private readonly ISubmissionService _submissionService;

        public SubmissionController(ISubmissionService SubmissionService)
        {
            _submissionService = SubmissionService;
        }

        // Tạo submission cho assignment trong một class cụ thể
        [HttpPost("classes/{classId}/assignments/{assignmentId}/submissions")]
        public async Task<CreateSubmissionResponse> CreateSubmission(
            int classId,
            int assignmentId,
            [FromBody] CreateSubmissionRequest request)
        {
            CreateSubmissionResponse response = await _submissionService.CreateSubmission(request, assignmentId, classId);
            return response;
        }

        // Cập nhật submission cho assignment trong một class cụ thể
        [HttpPut("classes/{classId}/assignments/{assignmentId}/submissions")]
        public async Task<SubmissionResponse> UpdateSubmission(
            int classId,
            int assignmentId,
            [FromBody] UpdateSubmissionRequest request)
        {
            SubmissionResponse response = await _submissionService.UpdateSubmission(request, assignmentId, classId);
            return response;
        }

        // Lấy tất cả submission của 1 assignment (từ tất cả các class)
        [HttpGet("assignments/{assignmentId}/submissions")]
        public async Task<List<SubmissionResponse>> GetSubmissionsByAssignmentId(int assignmentId)
        {
            return await _submissionService.GetSubmissionsByAssignmentId(assignmentId);
        }

        // Lấy tất cả submission của 1 assignment trong 1 class cụ thể
        [HttpGet("classes/{classId}/assignments/{assignmentId}/teacher/submissions")]
        public async Task<List<SubmissionResponse>> GetSubmissionsByAssignmentAndClass(int classId, int assignmentId)
        {
            return await _submissionService.GetSubmissionsByAssignmentAndClass(assignmentId, classId);
        }

        // Lấy submission theo Id
        [HttpGet("submissions/{submissionId}")]
        public async Task<SubmissionResponse> GetSubmissionById(int submissionId)
        {
            SubmissionResponse submission = await _submissionService.GetSubmissionById(submissionId);
            return submission;
        }

        [HttpGet("classes/{classId}/assignments/{assignmentId}/student/submission")]
        public async Task<CreateSubmissionResponse> GetSafeSubmissionForStudent(int assignmentId, int classId)
        {
            CreateSubmissionResponse submission = await _submissionService.GetSafeSubmissionForStudent(assignmentId, classId);
            return submission;
        }

        // Lấy danh sách tất cả submission chưa được chấm điểm (dành cho giáo viên)
        [HttpGet("submissions/ungraded")]
        public async Task<List<SubmissionResponse>> GetUngradedEssaySubmissions()
        {
            return await _submissionService.GetUngradedEssaySubmissions();
        }

        // Hủy bài nộp (chỉ được phép nếu chưa quá deadline và chưa được chấm điểm)
        [HttpDelete("assignments/{assignmentId}/submissions/{submissionId}")]
        public async Task<IActionResult> CancelSubmission(int assignmentId, int submissionId)
        {
            bool result = await _submissionService.CancelSubmission(submissionId, assignmentId);
            return Ok(new { success = result, message = "Đã hủy bài nộp thành công" });
        }

    }
}