using Microsoft.AspNetCore.Http;

namespace OnlineClassroomManagement.Models.Requests.Quizs
{
    public class ParseExcelToQuizRequest
    {
        public IFormFile ExcelFile { get; set; } = null!;
    }
}
