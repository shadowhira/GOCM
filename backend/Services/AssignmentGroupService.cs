using System.Text.RegularExpressions;
using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Requests.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using OnlineClassroomManagement.Models.Responses.AssignmentGroupTopics;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAssignmentGroupService
    {
        Task<AssignmentGroupResponse> CreateAssignmentGroup(CreateAssignmentGroupRequest request, int assignmentId, int classId);
        Task<AssignmentGroupResponse> UpdateAssignmentGroup(UpdateAssignmentGroupRequest request, int assignmentGroupId);
        Task LeaveAssignmentGroup(int assignmentGroupId);
        Task JoinAssignmentGroup(int assignmentGroupId);
        Task InviteMemberToAssignmentGroup(int assignmentGroupId, int toMemberId);
        Task RemoveMemberFromGroup(int assignmentGroupId, int groupMemberId);
        Task TransferLeadership(int assignmentGroupId, int newLeaderMemberId);
        Task RequestAssignmentGroupApproval(int assignmentGroupId, int topicId);
        Task AcceptRequestCreateAssignmentGroup(int approvalRequestId);
        Task RejectRequestCreateAssignmentGroup(int approvalRequestId, string reason);
        Task<AssignmentGroupResponse> GetAssignmentGroupById(int assignmentGroupId);
        Task<List<AssignmentGroupResponse>> GetAllAssignmentGroupsForAssignment(int assignmentId, int classId);
        Task<AssignmentGroupResponse?> GetMyAssignmentGroup(int assignmentId, int classId);
        Task<List<AssignmentGroupApprovalRequestResponse>> GetAllApprovalRequestInAssignmentGroup(int assignmentId, int classId);
    }

    public class AssignmentGroupService : IAssignmentGroupService
    {
        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public AssignmentGroupService(IRepository repository, ICurrentUserService currentUserService, IMapper mapper, INotificationService notificationService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<AssignmentGroupResponse> CreateAssignmentGroup(CreateAssignmentGroupRequest request, int assignmentId, int classId)
        {
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.Assignment.Id == assignmentId && a.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(a => a.AssignmentGroups)
                                            .ThenInclude(ag => ag.GroupMembers)
                                            .ThenInclude(agm => agm.Member)
                                            .ThenInclude(cm => cm.User)
                                            .Include(a => a.Class)
                                            .ThenInclude(c => c.Members)
                                            .ThenInclude(cm => cm.User)
                                            .Include(a => a.Assignment);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (assignmentInClass.Assignment.Type != AssignmentType.Group)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AssignmentNotGroupType);
            }

            AssignmentGroup assignmentGroup = _mapper.Map<AssignmentGroup>(request);

            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);
        
            
            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Student)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.OnlyStudentCanCreateGroup);
            }

            if (assignmentInClass.AssignmentGroups.Any(ag => ag.GroupMembers.Any(agm => agm.Member.Id == classMember.Id)))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AlreadyJoinedGroup);
            }

            assignmentGroup.GroupMembers.Add(new AssignmentGroupMember
            {
                Member = classMember,
                IsLeader = true,
                JoinedAt = DateTime.UtcNow
            });
            assignmentGroup.Status = AssignmentGroupStatus.Draft;
            assignmentGroup.CreatedAt = DateTime.UtcNow;
            assignmentGroup.UpdatedAt = DateTime.UtcNow;

            assignmentInClass.AssignmentGroups.Add(assignmentGroup);
            _repository.Update(assignmentInClass);
            await _repository.SaveChangesAsync();

            return _mapper.Map<AssignmentGroupResponse>(assignmentGroup);
        }

        public async Task LeaveAssignmentGroup(int assignmentGroupId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(ag => ag.AssignmentGroups.Any(g => g.Id == assignmentGroupId));
            assignmentInClassSpec.Includes = q => q.Include(ag => ag.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(ag => ag.Assignment);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);
            
            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotClassMember);

            AssignmentGroupMember groupMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.Id == classMember.Id)
                ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotGroupMember);

            if (assignmentGroup.Status == AssignmentGroupStatus.PendingApproval || assignmentGroup.Status == AssignmentGroupStatus.Approved)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.CannotLeaveApprovedGroup);
            }

            if (assignmentGroup.GroupMembers.Count == 1)
            {
                _repository.Remove(assignmentGroup);
                await _repository.SaveChangesAsync();
                return;
            }

            if (groupMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.LeaderCannotLeave);
            }

            // Get list of other members before removing
            List<int> otherMemberIds = assignmentGroup.GroupMembers
                .Where(gm => gm.Member?.User != null && gm.Member.User.Id != currentUser.Id)
                .Select(gm => gm.Member!.User!.Id)
                .Distinct()
                .ToList();

            assignmentGroup.GroupMembers.Remove(groupMember);
            _repository.Update(assignmentGroup);
            await _repository.SaveChangesAsync();

            // Notify remaining group members that a member has left
            if (otherMemberIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_member_left",
                    Data = new Dictionary<string, string>
                    {
                        { "memberName", currentUser.DisplayName ?? string.Empty },
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", assignmentInClass.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = otherMemberIds,
                    LinkRedirect = $"/class/{assignmentInClass.Class?.Id}/assignment-groups/{assignmentInClass.Assignment?.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        // Tham gia nhóm
        public async Task JoinAssignmentGroup(int assignmentGroupId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(ag => ag.AssignmentGroups.Any(g => g.Id == assignmentGroupId));
            assignmentInClassSpec.Includes = q => q.Include(ag => ag.AssignmentGroups)
                                                  .ThenInclude(g => g.GroupMembers)
                                                  .ThenInclude(agm => agm.Member)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(ag => ag.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (assignmentInClass.AssignmentGroups.Any(ag => ag.GroupMembers.Any(agm => agm.Member.User.Id == currentUser.Id)))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AlreadyJoinedGroup);
            }

            ClassMember member = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotClassMember);

            if (member.RoleInClass != RoleInClass.Student)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotStudent);
            }

            if (assignmentGroup.GroupMembers.Any(agm => agm.Member.Id == member.Id))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AlreadyGroupMember);
            }

            if (assignmentGroup.Status == AssignmentGroupStatus.PendingApproval || assignmentGroup.Status == AssignmentGroupStatus.Approved)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.CannotJoinApprovedGroup);
            }

            assignmentGroup.GroupMembers.Add(new AssignmentGroupMember
            {
                Member = member,
                IsLeader = false,
                JoinedAt = DateTime.UtcNow
            });
            _repository.Update(assignmentGroup);
        }
    
        // Mời thành viên vào nhóm
        public async Task InviteMemberToAssignmentGroup(int assignmentGroupId, int toMemberId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User)
                                                .Include(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(tm => tm.User);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            AssignmentGroupMember inviterMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.NotGroupMember);

            if (!inviterMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.OnlyLeaderCanInvite);
            }

            if (assignmentGroup.Status == AssignmentGroupStatus.PendingApproval || assignmentGroup.Status == AssignmentGroupStatus.Approved)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.CannotInviteToApprovedGroup);
            }

            Specification<ClassMember> toMemberSpec = new Specification<ClassMember>();
            toMemberSpec.Conditions.Add(cm => cm.Id == toMemberId);
            toMemberSpec.Includes = q => q.Include(cm => cm.User);

            ClassMember toMember = await _repository.GetAsync(toMemberSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.MemberNotFound);

            if (assignmentGroup.GroupMembers.Any(agm => agm.Member.Id == toMember.Id))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.MemberAlreadyInGroup);
            }

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(ag => ag.AssignmentGroups.Any(g => g.Id == assignmentGroupId));
            assignmentInClassSpec.Includes = q => q
                .Include(aic => aic.Class)
                    .ThenInclude(c => c.Members)
                        .ThenInclude(cm => cm.User)
                .Include(aic => aic.Assignment)
                .Include(aic => aic.AssignmentGroups)
                    .ThenInclude(g => g.GroupMembers)
                        .ThenInclude(agm => agm.Member)
                            .ThenInclude(cm => cm.User)
                .Include(aic => aic.AssignmentGroups)
                    .ThenInclude(g => g.GroupInvitations)
                        .ThenInclude(agi => agi.ToMember)
                            .ThenInclude(tm => tm.User)
                .Include(aic => aic.AssignmentGroups)
                    .ThenInclude(g => g.GroupInvitations)
                        .ThenInclude(agi => agi.FromMember)
                            .ThenInclude(fm => fm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (assignmentInClass.AssignmentGroups.Any(ag => ag.GroupMembers.Any(agm => agm.Member.Id == toMember.Id)))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.MemberInOtherGroup);
            }

            if (assignmentGroup.GroupInvitations.Any(agi => agi.ToMember.Id == toMember.Id && agi.FromMember.Id == inviterMember.Member.Id && agi.Status == AssignmentGroupInvitationStatus.Pending))
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AlreadySentInvitation);
            }

            AssignmentGroupInvitation invitation = new AssignmentGroupInvitation
            {
                FromMember = inviterMember.Member,
                ToMember = toMember,
                SentAt = DateTime.UtcNow,
                Status = AssignmentGroupInvitationStatus.Pending
            };

            if (assignmentGroup.GroupInvitations == null)
            {
                assignmentGroup.GroupInvitations = new();
            }

            assignmentGroup.GroupInvitations.Add(invitation);
            _repository.Update(assignmentGroup);
            await _repository.SaveChangesAsync();

            // Notify invited member
            if (toMember.User != null)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_invited",
                    Data = new Dictionary<string, string>
                    {
                        { "inviterName", currentUser.DisplayName ?? string.Empty },
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "assignmentTitle", assignmentInClass.Assignment?.Title ?? string.Empty },
                        { "className", assignmentInClass.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { toMember.User.Id },
                    LinkRedirect = $"/class/{assignmentInClass.Class?.Id}/assignment-groups/{assignmentInClass.Assignment?.Id}?openInvitations=true",
                    OpenNewTab = false,
                    NeedSendEmail = true,
                    MailTitle = $"[OCM] Lời mời tham gia nhóm: {assignmentGroup.Name}",
                    MailHtmlContent = $"<p><b>{currentUser.DisplayName}</b> đã mời bạn tham gia nhóm <b>{assignmentGroup.Name}</b> cho bài tập <b>{assignmentInClass.Assignment?.Title}</b> trong lớp <b>{assignmentInClass.Class?.Name}</b>.</p><p>Vui lòng đăng nhập để xem và phản hồi lời mời.</p>"
                });
            }
        }

        public async Task<List<AssignmentGroupResponse>> GetAllAssignmentGroupsForAssignment(int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Class.Id == classId && aic.Assignment.Id == assignmentId);
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User)
                                                .Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(tm => tm.User)
                                                .Include(aic => aic.Class)
                                                .ThenInclude(c => c.Members)
                                                .ThenInclude(cm => cm.User);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);
            
            if (!assignmentInClass.Class.Members.Any(cm => cm.User.Id == currentUser.Id))
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);
            }

            return _mapper.Map<List<AssignmentGroupResponse>>(assignmentInClass.AssignmentGroups);
        }

        public async Task<AssignmentGroupResponse> UpdateAssignmentGroup(UpdateAssignmentGroupRequest request, int assignmentGroupId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);
            
            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);
            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            AssignmentGroupMember currentMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotGroupMember);

            if (!currentMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyLeaderCanUpdate);
            }

            // Update the assignment group with the request data
            assignmentGroup = _mapper.Map(request, assignmentGroup);
            assignmentGroup.UpdatedAt = DateTime.UtcNow;

            _repository.Update(assignmentGroup);
            await _repository.SaveChangesAsync();

            return _mapper.Map<AssignmentGroupResponse>(assignmentGroup);
        }

        public async Task RemoveMemberFromGroup(int assignmentGroupId, int groupMemberId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);
            
            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);
            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            AssignmentGroupMember currentMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotGroupMember);

            if (!currentMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyLeaderCanRemoveMember);
            }

            AssignmentGroupMember memberToRemove = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Id == groupMemberId)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.GroupMemberNotFound);

            // Get class and assignment info for notifications
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.AssignmentGroups.Any(ag => ag.Id == assignmentGroupId));
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Class)
                                                  .Include(aic => aic.Assignment);
            AssignmentInClass? assignmentInClass = await _repository.GetAsync(assignmentInClassSpec);

            // Store info before removing
            int? kickedUserId = memberToRemove.Member?.User?.Id;
            string kickedUserName = memberToRemove.Member?.User?.DisplayName ?? string.Empty;

            // Get other member ids (excluding current user and removed member)
            List<int> otherMemberIds = assignmentGroup.GroupMembers
                .Where(gm => gm.Member?.User != null 
                    && gm.Member.User.Id != currentUser.Id 
                    && gm.Id != groupMemberId)
                .Select(gm => gm.Member!.User!.Id)
                .Distinct()
                .ToList();

            assignmentGroup.GroupMembers.Remove(memberToRemove);
            _repository.Update(assignmentGroup);
            await _repository.SaveChangesAsync();

            // Notify the kicked member
            if (kickedUserId.HasValue)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_member_kicked",
                    Data = new Dictionary<string, string>
                    {
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", assignmentInClass?.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { kickedUserId.Value },
                    LinkRedirect = assignmentInClass?.Class != null && assignmentInClass.Assignment != null
                        ? $"/class/{assignmentInClass.Class.Id}/assignment-groups/{assignmentInClass.Assignment.Id}"
                        : null,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }

            // Notify other members that a member was removed
            if (otherMemberIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_member_removed",
                    Data = new Dictionary<string, string>
                    {
                        { "memberName", kickedUserName },
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", assignmentInClass?.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = otherMemberIds,
                    LinkRedirect = assignmentInClass?.Class != null && assignmentInClass.Assignment != null
                        ? $"/class/{assignmentInClass.Class.Id}/assignment-groups/{assignmentInClass.Assignment.Id}"
                        : null,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task<AssignmentGroupResponse> GetAssignmentGroupById(int assignmentGroupId)
        {       
            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User)
                                                .Include(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(tm => tm.User);
            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            return _mapper.Map<AssignmentGroupResponse>(assignmentGroup);
        }

        public async Task RequestAssignmentGroupApproval(int assignmentGroupId, int topicId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            if (assignmentGroup.Status != AssignmentGroupStatus.Draft)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.OnlyDraftCanRequestApproval);
            }

            AssignmentGroupMember requesterMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotGroupMember);

            if (!requesterMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.OnlyLeaderCanRequestApproval);
            }

            // Tìm lớp học liên quan đến nhóm bài tập
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.AssignmentGroups.Any(ag => ag.Id == assignmentGroupId));
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(aic => aic.AssignmentGroups)
                                                  .ThenInclude(ag => ag.GroupMembers)
                                                  .ThenInclude(agm => agm.Member)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(aic => aic.AssignmentGroupTopics)
                                                  .ThenInclude(agt => agt.AssignmentGroups)
                                                  .Include(aic => aic.AssignmentGroupTopics)
                                                  .ThenInclude(agt => agt.ApprovalRequests)
                                                  .Include(aic => aic.Assignment);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            AssignmentGroupTopic topic = assignmentInClass.AssignmentGroupTopics
                .FirstOrDefault(t => t.Id == topicId)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            // Số lượng nhóm đã chọn chủ đề này (đã được duyệt và đang chờ duyệt)
            int groupsSelectedTopicCount = topic.ApprovalRequests.Count(a => a.Status == AssignmentGroupApprovalStatus.Approved || a.Status == AssignmentGroupApprovalStatus.Pending);
            if (groupsSelectedTopicCount >= topic.MaxGroupsPerTopic)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.TopicMaxGroupsReached);
            }

            // Số lượng thành viên trong nhóm
            int memberCount = assignmentGroup.GroupMembers.Count;
            if (memberCount < topic.MinMembers || memberCount > topic.MaxMembers)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.GroupMemberCountInvalid);
            }

            if (assignmentInClass.Assignment.Status == AssignmentStatus.Expired)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.CannotRequestExpiredAssignment);
            }

            assignmentGroup.Status = AssignmentGroupStatus.PendingApproval;
            assignmentGroup.UpdatedAt = DateTime.UtcNow;
            _repository.Update(assignmentGroup);

            // Tạo yêu cầu duyệt nhóm
            AssignmentGroupApprovalRequest approvalRequest = new AssignmentGroupApprovalRequest
            {
                Status = AssignmentGroupApprovalStatus.Pending,
                RequestedAt = DateTime.UtcNow,
            };
            assignmentGroup.ApprovalRequests.Add(approvalRequest);
            topic.ApprovalRequests.Add(approvalRequest);
            await _repository.SaveChangesAsync();

            // Notify teachers that a group requested approval
            List<int> teacherIds = assignmentInClass.Class.Members
                .Where(m => m.User != null && m.RoleInClass == RoleInClass.Teacher)
                .Select(m => m.User.Id)
                .Where(id => id != currentUser.Id)
                .Distinct()
                .ToList();

            if (teacherIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_submitted_for_approval",
                    Data = new Dictionary<string, string>
                    {
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "topicTitle", topic.Title ?? string.Empty },
                        { "assignmentTitle", assignmentInClass.Assignment?.Title ?? string.Empty },
                        { "className", assignmentInClass.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = teacherIds,
                    LinkRedirect = $"/class/{assignmentInClass.Class.Id}/assignment-groups/{assignmentInClass.Assignment?.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task AcceptRequestCreateAssignmentGroup(int approvalRequestId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Tìm yêu cầu duyệt nhóm
            Specification<AssignmentGroupApprovalRequest> approvalRequestSpec = new Specification<AssignmentGroupApprovalRequest>();
            approvalRequestSpec.Conditions.Add(ar => ar.Id == approvalRequestId);

            AssignmentGroupApprovalRequest approvalRequest = await _repository.GetAsync(approvalRequestSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ApprovalRequestNotFound);

            // Tìm thông tin nhóm bài tập
            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.ApprovalRequests.Any(ar => ar.Id == approvalRequestId));
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                  .ThenInclude(agm => agm.Member)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(ag => ag.ApprovalRequests);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.GroupInfoNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.AssignmentGroups.Any(ag => ag.Id == assignmentGroup.Id));
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(aic => aic.Assignment)
                                                  .Include(aic => aic.AssignmentGroups)
                                                  .Include(aic => aic.AssignmentGroupTopics)
                                                  .ThenInclude(agt => agt.AssignmentGroups);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInfoNotFound);

            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.OnlyTeacherCanApprove);
            }

            if (assignmentGroup.Status != AssignmentGroupStatus.PendingApproval)
            {
                 throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.GroupNotPendingApproval);
            }

            AssignmentGroupTopic topic = assignmentInClass.AssignmentGroupTopics
                .FirstOrDefault(agt => agt.ApprovalRequests.Any(ar => ar.Id == approvalRequestId))
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicNotFound);

            int groupsSelectedTopicCount = topic.AssignmentGroups.Count;
            if (groupsSelectedTopicCount >= topic.MaxGroupsPerTopic)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.TopicMaxGroupsReached);
            }

            assignmentGroup.Status = AssignmentGroupStatus.Approved;
            assignmentGroup.UpdatedAt = DateTime.UtcNow;
            _repository.Update(assignmentGroup);

            approvalRequest.Status = AssignmentGroupApprovalStatus.Approved;
            approvalRequest.RespondedAt = DateTime.UtcNow;
            _repository.Update(approvalRequest);

            topic.AssignmentGroups.Add(assignmentGroup);
            await _repository.SaveChangesAsync();

            // Notify group members that the group was approved
            List<int> memberIds = assignmentGroup.GroupMembers
                .Where(gm => gm.Member?.User != null)
                .Select(gm => gm.Member.User.Id)
                .Where(id => id != currentUser.Id)
                .Distinct()
                .ToList();

            if (memberIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_approved",
                    Data = new Dictionary<string, string>
                    {
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", assignmentInClass.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = memberIds,
                    LinkRedirect = $"/class/{assignmentInClass.Class.Id}/assignment-groups/{assignmentInClass.Assignment?.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task RejectRequestCreateAssignmentGroup(int approvalRequestId, string reason)
        {
             User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            // Tìm yêu cầu duyệt nhóm
            Specification<AssignmentGroupApprovalRequest> approvalRequestSpec = new Specification<AssignmentGroupApprovalRequest>();
            approvalRequestSpec.Conditions.Add(ar => ar.Id == approvalRequestId);

            AssignmentGroupApprovalRequest approvalRequest = await _repository.GetAsync(approvalRequestSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.ApprovalRequestNotFound);

            // Tìm thông tin nhóm bài tập
            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.ApprovalRequests.Any(ar => ar.Id == approvalRequestId));
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                  .ThenInclude(agm => agm.Member)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(ag => ag.ApprovalRequests);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.GroupInfoNotFound);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.AssignmentGroups.Any(ag => ag.Id == assignmentGroup.Id));
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.Class)
                                                  .ThenInclude(c => c.Members)
                                                  .ThenInclude(cm => cm.User)
                                                  .Include(aic => aic.AssignmentGroups)
                                                  .Include(aic => aic.AssignmentGroupTopics)
                                                  .ThenInclude(agt => agt.AssignmentGroups);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInfoNotFound);

            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.OnlyTeacherCanReject);
            }

            if (assignmentGroup.Status != AssignmentGroupStatus.PendingApproval)
            {
                 throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.GroupNotPendingApproval);
            }

            assignmentGroup.Status = AssignmentGroupStatus.Draft;
            assignmentGroup.UpdatedAt = DateTime.UtcNow;
            _repository.Update(assignmentGroup);

            approvalRequest.Status = AssignmentGroupApprovalStatus.Rejected;
            approvalRequest.RespondedAt = DateTime.UtcNow;
            approvalRequest.RejectReason = reason;
            _repository.Update(approvalRequest);
            await _repository.SaveChangesAsync();

            // Notify group members that the group was rejected
            List<int> memberIds = assignmentGroup.GroupMembers
                .Where(gm => gm.Member?.User != null)
                .Select(gm => gm.Member.User.Id)
                .Where(id => id != currentUser.Id)
                .Distinct()
                .ToList();

            if (memberIds.Count > 0)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_rejected",
                    Data = new Dictionary<string, string>
                    {
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", assignmentInClass.Class?.Name ?? string.Empty },
                        { "reason", reason ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = memberIds,
                    LinkRedirect = $"/class/{assignmentInClass.Class.Id}/assignment-groups/{assignmentInClass.Assignment?.Id}",
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task<AssignmentGroupResponse?> GetMyAssignmentGroup(int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Class.Id == classId && aic.Assignment.Id == assignmentId);
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User)
                                                .Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(tm => tm.User)
                                                .Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.ApprovalRequests)
                                                .Include(aic => aic.Class)
                                                .ThenInclude(c => c.Members)
                                                .Include(aic => aic.AssignmentGroupTopics)
                                                .ThenInclude(agt => agt.AssignmentGroups);

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            AssignmentGroup? myGroup = assignmentInClass.AssignmentGroups
                .FirstOrDefault(ag => ag.GroupMembers.Any(gm => gm.Member.User.Id == currentUser.Id));
            
            // Trả về null nếu user chưa có nhóm (trạng thái hợp lệ)
            if (myGroup == null)
            {
                return null;
            }

            AssignmentGroupResponse response = _mapper.Map<AssignmentGroupResponse>(myGroup);
            if (myGroup.Status == AssignmentGroupStatus.Approved)
            {
                AssignmentGroupTopic? topic = assignmentInClass.AssignmentGroupTopics
                    .FirstOrDefault(agt => agt.AssignmentGroups.Any(ag => ag.Id == myGroup.Id));
                
                if (topic != null)
                {
                    response.AssignmentGroupTopicId = topic.Id;
                }
            }
            if (myGroup.Status == AssignmentGroupStatus.PendingApproval)
            {
                AssignmentGroupApprovalRequest approvalRequest = myGroup.ApprovalRequests
                    .FirstOrDefault(ar => ar.Status == AssignmentGroupApprovalStatus.Pending)
                    ?? throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.PendingApprovalNotFound);
                
                AssignmentGroupTopic? topic = assignmentInClass.AssignmentGroupTopics
                    .FirstOrDefault(agt => agt.ApprovalRequests.Any(ar => ar.Id == approvalRequest.Id));
                
                if (topic != null)
                {
                    response.AssignmentGroupTopicId = topic.Id;
                }
            }

            return response;
        }

        public async Task<List<AssignmentGroupApprovalRequestResponse>> GetAllApprovalRequestInAssignmentGroup(int assignmentId, int classId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(aic => aic.Class.Id == classId && aic.Assignment.Id == assignmentId);
            assignmentInClassSpec.Includes = q => q.Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User)
                                                .Include(aic => aic.AssignmentGroups)
                                                .ThenInclude(ag => ag.ApprovalRequests)
                                                .Include(aic => aic.Class)
                                                .ThenInclude(c => c.Members)
                                                .ThenInclude(cm => cm.User)
                                                .Include(aic => aic.AssignmentGroupTopics)
                                                .ThenInclude(agt => agt.ApprovalRequests);
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);
            
            ClassMember classMember = assignmentInClass.Class.Members
                .FirstOrDefault(cm => cm.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            if (classMember.RoleInClass != RoleInClass.Teacher)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.OnlyTeacherCanViewApprovalRequests);
            }

            // Lấy tất cả các yêu cầu của các nhóm bài tập trong bài tập này, sắp xếp theo thời gian yêu cầu và trạng thái yêu cầu
            List<AssignmentGroupApprovalRequestResponse> allRequests = new();
            foreach (AssignmentGroup group in assignmentInClass.AssignmentGroups)
            {
                foreach (AssignmentGroupApprovalRequest request in group.ApprovalRequests)
                {
                    AssignmentGroupApprovalRequestResponse requestResponse = _mapper.Map<AssignmentGroupApprovalRequestResponse>(request);
                    requestResponse.AssignmentGroup = _mapper.Map<AssignmentGroupResponse>(group);
                    // tìm topic
                    AssignmentGroupTopic topic = assignmentInClass.AssignmentGroupTopics
                        .FirstOrDefault(t => t.ApprovalRequests.Any(ar => ar.Id == request.Id))
                        ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.TopicRelatedNotFound);

                    requestResponse.AssignmentGroupTopic = _mapper.Map<AssignmentGroupTopicResponse>(topic);
                    allRequests.Add(requestResponse);
                }
            }

            return allRequests.OrderByDescending(r => r.RequestedAt)
                              .ThenBy(r => r.Status == AssignmentGroupApprovalStatus.Pending ? 0 : 1)
                              .ToList();
        }

        public async Task TransferLeadership(int assignmentGroupId, int newLeaderMemberId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.Id == assignmentGroupId);
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);
            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);
            
            AssignmentGroupMember currentMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Member.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotGroupMember);

            if (!currentMember.IsLeader)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotGroupLeader);
            }

            AssignmentGroupMember newLeaderMember = assignmentGroup.GroupMembers
                .FirstOrDefault(agm => agm.Id == newLeaderMemberId)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.NewLeaderNotFound);

            if (newLeaderMember.Member.User.Id == currentUser.Id)
            {
                throw CustomException.WithKey(ExceptionCode.BadRequest, ErrorKeys.AlreadyLeader);
            }

            currentMember.IsLeader = false;
            newLeaderMember.IsLeader = true;

            _repository.Update(assignmentGroup);
            await _repository.SaveChangesAsync();
        }
    }
}