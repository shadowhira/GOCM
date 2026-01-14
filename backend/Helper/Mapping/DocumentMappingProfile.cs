using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Responses.Documents;

namespace OnlineClassroomManagement.Helper.MappingProfile
{
    public class DocumentMappingProfile : Profile
    {
        public DocumentMappingProfile()
        {
            // Document mappings
            CreateMap<Document, DocumentResponse>();
        }
    }
}
