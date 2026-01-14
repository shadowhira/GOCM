using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests.AssignmentGroupTopics;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAssignmentGroupTopicService
    {
        Task<AssignmentGroupTopicResponse> CreateAssignmentGroupTopic(CreateAssignmentGroupTopicRequest request, int assignmentId, int classId);
        Task<AssignmentGroupTopicResponse> UpdateAssignmentGroupTopic(int topicId, UpdateAssignmentGroupTopicRequest request);
        Task DeleteAssignmentGroupTopic(int topicId);
        Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicById(int topicId);
        Task<List<AssignmentGroupTopicResponse>> GetAllAssignmentGroupTopics(int assignmentId, int classId);
        Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicByGroupId(int groupId);
    }

    public class AssignmentGroupTopicService : IAssignmentGroupTopicService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public AssignmentGroupTopicService(IRepository repository, ICurrentUserService currentUserService, IMapper mapper)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<AssignmentGroupTopicResponse> CreateAssignmentGroupTopic(CreateAssignmentGroupTopicRequest request, int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.Assignment.Id == assignmentId && a.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(a => a.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(a => a.Assignment);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyTeacherCanCreateTopic);
            }

            if (assignmentInClass.Assignment.Status == AssignmentStatus.Expired)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.AssignmentExpired);
            }

            if (assignmentInClass.Assignment.Type != AssignmentType.Group)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.AssignmentNotGroupType);
            }

            AssignmentGroupTopic topic = _mapper.Map<AssignmentGroupTopic>(request);
            topic.CreatedAt = DateTime.UtcNow;
            topic.UpdatedAt = DateTime.UtcNow;

            if (assignmentInClass.AssignmentGroupTopics == null)
            {
                assignmentInClass.AssignmentGroupTopics = new();
            }
            assignmentInClass.AssignmentGroupTopics.Add(topic);

            _repository.Update(assignmentInClass);
            await _repository.SaveChangesAsync();

            return _mapper.Map<AssignmentGroupTopicResponse>(topic);
        }

        public async Task<AssignmentGroupTopicResponse> UpdateAssignmentGroupTopic(int topicId, UpdateAssignmentGroupTopicRequest request)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);
            
            Specification<AssignmentGroupTopic> topicSpec = new Specification<AssignmentGroupTopic>();
            topicSpec.Conditions.Add(t => t.Id == topicId);
            
            AssignmentGroupTopic topic = await _repository.GetAsync(topicSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.AssignmentGroupTopics.Any(t => t.Id == topicId));
            assignmentInClassSpec.Includes = q => q.Include(a => a.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User);
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyTeacherCanUpdateTopic);
            }
            
            _mapper.Map(request, topic);
            topic.UpdatedAt = DateTime.UtcNow;

            _repository.Update(topic);
            await _repository.SaveChangesAsync();

            return _mapper.Map<AssignmentGroupTopicResponse>(topic);
        }

        public async Task DeleteAssignmentGroupTopic(int id)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroupTopic> topicSpec = new Specification<AssignmentGroupTopic>();
            topicSpec.Conditions.Add(t => t.Id == id);
            topicSpec.Includes = q => q.Include(t => t.AssignmentGroups);

            AssignmentGroupTopic topic = await _repository.GetAsync(topicSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            if (topic.AssignmentGroups.Any())
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.CannotDeleteTopicWithGroups);
            }

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.AssignmentGroupTopics.Any(t => t.Id == id));
            assignmentInClassSpec.Includes = q => q.Include(a => a.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User);
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyTeacherCanDeleteTopic);
            }

            _repository.Remove(topic);
            await _repository.SaveChangesAsync();
        }

        public async Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicById(int topicId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroupTopic> topicSpec = new Specification<AssignmentGroupTopic>();
            topicSpec.Conditions.Add(t => t.Id == topicId);
            topicSpec.Includes = q => q.Include(t => t.AssignmentGroups)
                                       .ThenInclude(ag => ag.GroupMembers)
                                       .ThenInclude(agm => agm.Member)
                                       .ThenInclude(cm => cm.User);

            AssignmentGroupTopic topic = await _repository.GetAsync(topicSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.AssignmentGroupTopics.Any(t => t.Id == topicId));
            assignmentInClassSpec.Includes = q => q.Include(a => a.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User);
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (!assignmentInClass.Class.Members.Any(cm => cm.User.Id == currentUser.Id))
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);
            }

            AssignmentGroupTopicResponse topicResponse = _mapper.Map<AssignmentGroupTopicResponse>(topic);

            return topicResponse;
        }

        public async Task<List<AssignmentGroupTopicResponse>> GetAllAssignmentGroupTopics(int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.Assignment.Id == assignmentId && a.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(a => a.AssignmentGroupTopics)
                                                  .ThenInclude(at => at.AssignmentGroups)
                                                  .ThenInclude(ag => ag.GroupMembers)
                                                  .ThenInclude(agm => agm.Member)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(a => a.AssignmentGroupTopics)
                                                  .ThenInclude(at => at.ApprovalRequests)
                                                  .Include(a => a.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (!assignmentInClass.Class.Members.Any(cm => cm.User.Id == currentUser.Id))
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);
            }

            List<AssignmentGroupTopicResponse> topicResponse = _mapper.Map<List<AssignmentGroupTopicResponse>>(assignmentInClass.AssignmentGroupTopics);

            return topicResponse;
        }

        public async Task<AssignmentGroupTopicResponse> GetAssignmentGroupTopicByGroupId(int groupId)
        {
            Specification<AssignmentGroupTopic> topicSpec = new Specification<AssignmentGroupTopic>();
            topicSpec.Conditions.Add(t => t.AssignmentGroups.Any(ag => ag.Id == groupId));
            topicSpec.Includes = q => q.Include(t => t.AssignmentGroups)
                                       .ThenInclude(ag => ag.GroupMembers)
                                       .ThenInclude(agm => agm.Member)
                                       .ThenInclude(cm => cm.User);
            AssignmentGroupTopic topic = await _repository.GetAsync(topicSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            AssignmentGroupTopicResponse topicResponse = _mapper.Map<AssignmentGroupTopicResponse>(topic);

            return topicResponse;
        }
    }
}