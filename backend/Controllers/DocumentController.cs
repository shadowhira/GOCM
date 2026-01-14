using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineClassroomManagement.Services;
using OnlineClassroomManagement.Models.Requests.Documents;
using OnlineClassroomManagement.Models.Responses.Documents;
using TanvirArjel.EFCore.GenericRepository;
using OnlineClassroomManagement.Helper.Authorization;

namespace OnlineClassroomManagement.Controllers
{
    [Authorize(Policy = AuthorizationPolicies.RequireClassMember)]
    public class DocumentController : ApiControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        // GET api/Document/All
        [HttpGet("All")]
        public async Task<List<DocumentResponse>> GetAllDocuments()
        {
            return await _documentService.GetAllDocuments();
        }

        // GET api/Document/List
        [HttpGet("List")]
        public async Task<PaginatedList<DocumentResponse>> GetListDocuments([FromQuery] GetPaginatedDocumentsRequest request)
        {
            return await _documentService.GetListDocuments(request);
        }

        // GET api/Document/{id}
        [HttpGet("{id}")]
        public async Task<DocumentResponse> GetDocumentById(int id)
        {
            return await _documentService.GetDocumentById(id);
        }

        // GET api/Document/Class/{classId}
        [HttpGet("Class/{classId}")]
        public async Task<List<DocumentResponse>> GetDocumentsByClassId(int classId)
        {
            return await _documentService.GetDocumentsByClassId(classId);
        }

        // POST api/Document
        [HttpPost]
        public async Task<DocumentResponse> UploadDocument([FromForm] UploadDocumentRequest request)
        {
            return await _documentService.UploadDocument(request);
        }

        // DELETE api/Document/{id}
        [HttpDelete("{id}")]
        public async Task DeleteDocument(int id)
        {
            await _documentService.DeleteDocument(id);
        }
    }
}
