using Microsoft.AspNetCore.Mvc;
using OnlineClassroomManagement.Models.Responses.Storage;
using OnlineClassroomManagement.Services;

namespace OnlineClassroomManagement.Controllers
{
    // TESTING PURPOSE
    // Note: Phải tạo bucket(coi như ổ đĩa)  trên supabase storage trước!
    public class StorageController : ApiControllerBase
    {
        private readonly IStorageService _storageService;
        public StorageController(IStorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpPut]
        public async Task<StorageUploadResponse> UploadFile(IFormFile file)
        {
            return await _storageService.UploadFileAsync(file, "test", "test");
        }
    }
}
