using AutoMapper;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.AssignmentGroups;
using OnlineClassroomManagement.Models.Requests.AssignmentGroupTopics;
using OnlineClassroomManagement.Models.Requests.Assignments;
using OnlineClassroomManagement.Models.Responses;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics;
using OnlineClassroomManagement.Models.Responses.Assignments;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;

namespace OnlineClassroomManagement.Helper.Mapping
{
    public class AssignmentMappingProfile : Profile
    {
        public AssignmentMappingProfile()
        {

            // Create Assignment: Request → Entity
            CreateMap<CreateAssignmentRequest, Assignment>();
            CreateMap<CreateAssignmentFromExcelRequest, CreateAssignmentRequest>();

            // Update Assignment: Request → Entity
            CreateMap<UpdateAssignmentRequest, Assignment>()
            .ForMember(dest => dest.ListQuestions, opt => opt.Ignore());

            CreateMap<UpdateAssignmentRequest, CreateAssignmentRequest>();

            // Response: Entity → Response DTO
            CreateMap<Assignment, AssignmentResponse>();

            CreateMap<Assignment, AssignmentDetailResponse>();

            // Attachment: Request → Entity
            CreateMap<CreateAttachmentRequest, Document>();

            CreateMap<UpdateAttachmentRequest, Document>();

            CreateMap<UpdateAttachmentRequest, CreateAttachmentRequest>();

            CreateMap<Document, AttachmentResponse>();

            // AssignmentGroupTopic: Request → Entity
            CreateMap<CreateAssignmentGroupTopicRequest, AssignmentGroupTopic>();
            CreateMap<UpdateAssignmentGroupTopicRequest, AssignmentGroupTopic>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<AssignmentGroupTopic, AssignmentGroupTopicResponse>();

            // AssignmentGroup: Request → Entity
            CreateMap<CreateAssignmentGroupRequest, AssignmentGroup>();
            CreateMap<UpdateAssignmentGroupRequest, AssignmentGroup>();
            CreateMap<AssignmentGroup, AssignmentGroupResponse>();

            // AssignmentGroupMember: Request → Entity
            CreateMap<CreateAssignmentGroupMemberRequest, AssignmentGroupMember>();
            CreateMap<UpdateAssignmentGroupMemberRequest, AssignmentGroupMember>();
            CreateMap<AssignmentGroupMember, AssignmentGroupMemberResponse>();

            CreateMap<AssignmentGroupInvitation, AssignmentGroupInvitationResponse>();
            
            // AssignmentGroupApprovalRequest: Entity → Response
            CreateMap<AssignmentGroupApprovalRequest, AssignmentGroupApprovalRequestResponse>();
        }
    }
}