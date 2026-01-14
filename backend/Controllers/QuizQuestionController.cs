using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.Quizs;
using OnlineClassroomManagement.Services;

namespace OnlineClassroomManagement.Controllers
{
    public class QuizQuestionController : ApiControllerBase
    {
        private readonly IQuizQuestionService _quizQuestionService;

        public QuizQuestionController(IQuizQuestionService quizQuestionService)
        {
            _quizQuestionService = quizQuestionService;
        }
        
        [Consumes("multipart/form-data")]
        [HttpPost("parse-excel")]
        public async Task<List<QuizQuestion>> ParseExcelToQuizQuestions([FromForm] ParseExcelToQuizRequest request)
        {
            List<QuizQuestion> questions = await _quizQuestionService.CreateQuizQuestionsFromExcel(request.ExcelFile);
            return questions;
        }
    }
}
