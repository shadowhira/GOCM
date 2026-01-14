using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Controllers;
using OnlineClassroomManagement.Models.Requests.Grades;
using OnlineClassroomManagement.Models.Responses.Grades;
using OnlineClassroomManagement.Models.Responses.Submissions;
using OnlineClassroomManagement.Services;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class GradeController : ApiControllerBase
    {
        private readonly IGradeService _gradeService;

        public GradeController(IGradeService gradeService)
        {
            _gradeService = gradeService;
        }

        // Chấm điểm cho bài nộp dạng essay
        [HttpPost("submissions/{submissionId}")]
        public async Task<SubmissionResponse> GradeEssaySubmission(
            int submissionId,
            [FromBody] CreateGradeRequest request)
        {
            SubmissionResponse response = await _gradeService.GradeSubmission(request, submissionId);
            return response;
        }

        [HttpGet("class/{classId}/overview")]
        public async Task<ClassGradeOverviewResponse> GetClassGradeOverview(int classId)
        {
            ClassGradeOverviewResponse overview = await _gradeService.GetClassGradeOverview(classId);
            return overview;
        }

        [HttpGet("class/{classId}/students/averages")]
        public async Task<List<StudentAverageResponse>> GetStudentAverages(int classId)
        {
            List<StudentAverageResponse> averages = await _gradeService.GetStudentAveragesInClass(classId);
            return averages;
        }

        [HttpGet("class/{classId}/assignments")]
        public async Task<PaginatedList<AssignmentGradeSummaryResponse>> GetAssignmentGradeSummaries(
            [FromRoute] int classId,
            [FromQuery] GetPaginatedAssignmentGradeRequest request)
        {
            PaginatedList<AssignmentGradeSummaryResponse> summaries = await _gradeService.GetAssignmentGradeSummaries(classId, request);
            return summaries;
        }

        [HttpGet("class/{classId}/assignments/{assignmentId}/details")]
        public async Task<AssignmentGradeDetailResponse> GetAssignmentGradeDetails(int classId, int assignmentId)
        {
            AssignmentGradeDetailResponse details = await _gradeService.GetAssignmentGradeDetails(classId, assignmentId);
            return details;
        }

        // Student View API
        [HttpGet("class/{classId}/student/my-grades")]
        public async Task<StudentGradesSummaryResponse> GetMyGrades(int classId)
        {
            StudentGradesSummaryResponse myGrades = await _gradeService.GetMyGrades(classId);
            return myGrades;
        }

        // Lấy thống kê chấm điểm cho assignment
        [HttpGet("assignments/{assignmentId}/grading-statistics")]
        public async Task<GradingStatistics> GetGradingStatistics(int assignmentId)
        {
            return await _gradeService.GetGradingStatistics(assignmentId);
        }
    }
}