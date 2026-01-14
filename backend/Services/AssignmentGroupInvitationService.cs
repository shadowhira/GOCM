using AutoMapper;
using Common.Exceptions;
using Microsoft.EntityFrameworkCore;
using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Entities;
using OnlineClassroomManagement.Models.Requests;
using OnlineClassroomManagement.Models.Responses.AssignmentGroups;
using TanvirArjel.EFCore.GenericRepository;

namespace OnlineClassroomManagement.Services
{
    public interface IAssignmentGroupInvitationService
    {
        Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForToMemberInAssignment(int classId, int assignmentId);
        Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForFromMemberInAssignment(int classId, int assignmentId);
        Task AcceptInvitation(int invitationId);
        Task RejectInvitation(int invitationId);
        Task CancelInvitation(int invitationId);
    }

    public class AssignmentGroupInvitationService : IAssignmentGroupInvitationService
    {

        private readonly IRepository _repository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        private readonly IAssignmentGroupService _assignmentGroupService;
        private readonly INotificationService _notificationService;
    
        public AssignmentGroupInvitationService(IRepository repository, ICurrentUserService currentUserService, IMapper mapper, IAssignmentGroupService assignmentGroupService, INotificationService notificationService)
        {
            _repository = repository;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _assignmentGroupService = assignmentGroupService;
            _notificationService = notificationService;
        }

        public async Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForToMemberInAssignment(int classId, int assignmentId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.Assignment.Id == assignmentId && a.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(a => a.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(cm => cm.User)
                                                .Include(a => a.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.FromMember)
                                                .ThenInclude(cm => cm.User)
                                                .Include(a => a.Assignment)
                                                .Include(a => a.Class)
                                                .ThenInclude(c => c.Members)
                                                .ThenInclude(cm => cm.User);
                                                
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (assignmentInClass.Assignment.Type != AssignmentType.Group)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AssignmentNotGroupType);
            }

            
            ClassMember member = assignmentInClass.Class.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            List<AssignmentGroupInvitation> invitations = assignmentInClass.AssignmentGroups
                .SelectMany(ag => ag.GroupInvitations)
                .Where(agi => agi.ToMember.Id == member.Id)
                .ToList();

            return _mapper.Map<List<AssignmentGroupInvitationResponse>>(invitations);
        }

        public async Task<List<AssignmentGroupInvitationResponse>> GetListInvitationForFromMemberInAssignment(int classId, int assignmentId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(a => a.Assignment.Id == assignmentId && a.Class.Id == classId);
            assignmentInClassSpec.Includes = q => q.Include(a => a.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember)
                                                .ThenInclude(cm => cm.User)
                                                .Include(a => a.AssignmentGroups)
                                                .ThenInclude(ag => ag.GroupInvitations)
                                                .ThenInclude(agi => agi.FromMember)
                                                .ThenInclude(cm => cm.User)
                                                .Include(a => a.Assignment)
                                                .Include(a => a.Class)
                                                .ThenInclude(c => c.Members)
                                                .ThenInclude(cm => cm.User);
                                                
            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            if (assignmentInClass.Assignment.Type != AssignmentType.Group)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.AssignmentNotGroupType);
            }

            
            ClassMember member = assignmentInClass.Class.Members
                .FirstOrDefault(m => m.User.Id == currentUser.Id)
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotClassMember);

            List<AssignmentGroupInvitation> invitations = assignmentInClass.AssignmentGroups
                .SelectMany(ag => ag.GroupInvitations)
                .Where(agi => agi.FromMember.Id == member.Id)
                .ToList();

            return _mapper.Map<List<AssignmentGroupInvitationResponse>>(invitations);
        }

        public async Task AcceptInvitation(int invitationId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroupInvitation> invitationSpec = new Specification<AssignmentGroupInvitation>();
            invitationSpec.Conditions.Add(agi => agi.Id == invitationId);
            invitationSpec.Includes = q => q.Include(agi => agi.ToMember)
                                            .ThenInclude(cm => cm.User)
                                            .Include(agi => agi.FromMember)
                                            .ThenInclude(cm => cm.User);

            AssignmentGroupInvitation invitation =  await _repository.GetAsync(invitationSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.InvitationNotFound);

            Specification<AssignmentGroup> assignmentGroupSpec = new Specification<AssignmentGroup>();
            assignmentGroupSpec.Conditions.Add(ag => ag.GroupInvitations.Any(agi => agi.Id == invitationId));
            assignmentGroupSpec.Includes = q => q.Include(ag => ag.GroupMembers)
                                                .ThenInclude(agm => agm.Member)
                                                .ThenInclude(cm => cm.User);

            AssignmentGroup assignmentGroup = await _repository.GetAsync(assignmentGroupSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentGroupNotFound);

            if (invitation.ToMember.User.Id != currentUser.Id)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.InvitationNotYours);
            }

            if (invitation.Status != AssignmentGroupInvitationStatus.Pending)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.InvitationAlreadyProcessed);
            }

            await _assignmentGroupService.JoinAssignmentGroup(assignmentGroup.Id);
            invitation.Status = AssignmentGroupInvitationStatus.Accepted;
            invitation.RespondedAt = DateTime.UtcNow;
            _repository.Update(invitation);

            // Danh sách các group trong cùng bài tập với người gửi
            Specification<AssignmentInClass> assignmentInClassSpec = new Specification<AssignmentInClass>();
            assignmentInClassSpec.Conditions.Add(ag => ag.AssignmentGroups.Any(g => g.Id == assignmentGroup.Id));
            assignmentInClassSpec.Includes = q => q.Include(ag => ag.AssignmentGroups)
                                                .ThenInclude(g => g.GroupInvitations)
                                                .ThenInclude(agi => agi.ToMember);  

            AssignmentInClass assignmentInClass = await _repository.GetAsync(assignmentInClassSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.AssignmentInClassNotFound);

            // Danh sách các mời lời khác tới người dùng trong bài tập này
            List<AssignmentGroupInvitation> otherInvitations = assignmentInClass.AssignmentGroups
                .SelectMany(ag => ag.GroupInvitations)
                .Where(agi => agi.ToMember.Id == invitation.ToMember.Id && agi.Id != invitation.Id && agi.Status == AssignmentGroupInvitationStatus.Pending)
                .ToList();

            // Từ chối các lời mời này
            foreach (AssignmentGroupInvitation otherInvitation in otherInvitations)
            {
                otherInvitation.Status = AssignmentGroupInvitationStatus.Rejected;
                otherInvitation.RespondedAt = DateTime.UtcNow;
                _repository.Update(otherInvitation);
            }

            await _repository.SaveChangesAsync();

            // Notify inviter that the invitation was accepted
            if (invitation.FromMember?.User != null)
            {
                AssignmentInClass? aic = await _repository.GetAsync<AssignmentInClass>(
                    a => a.AssignmentGroups.Any(g => g.Id == assignmentGroup.Id),
                    includes: q => q.Include(x => x.Class).Include(x => x.Assignment));

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_invitation_accepted",
                    Data = new Dictionary<string, string>
                    {
                        { "userName", currentUser.DisplayName ?? string.Empty },
                        { "groupName", assignmentGroup.Name ?? string.Empty },
                        { "className", aic?.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { invitation.FromMember.User.Id },
                    LinkRedirect = aic?.Class != null && aic.Assignment != null
                        ? $"/class/{aic.Class.Id}/assignment-groups/{aic.Assignment.Id}"
                        : null,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });

                // Notify other group members that a new member has joined (excluding the inviter and new member)
                List<int> otherMemberIds = assignmentGroup.GroupMembers
                    .Where(gm => gm.Member?.User != null 
                        && gm.Member.User.Id != currentUser.Id 
                        && gm.Member.User.Id != invitation.FromMember.User.Id)
                    .Select(gm => gm.Member!.User!.Id)
                    .Distinct()
                    .ToList();

                if (otherMemberIds.Count > 0)
                {
                    await _notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Type = "assignment_group_member_joined",
                        Data = new Dictionary<string, string>
                        {
                            { "memberName", currentUser.DisplayName ?? string.Empty },
                            { "groupName", assignmentGroup.Name ?? string.Empty },
                            { "className", aic?.Class?.Name ?? string.Empty }
                        },
                        SenderId = currentUser.Id,
                        ReceiverIds = otherMemberIds,
                        LinkRedirect = aic?.Class != null && aic.Assignment != null
                            ? $"/class/{aic.Class.Id}/assignment-groups/{aic.Assignment.Id}"
                            : null,
                        OpenNewTab = false,
                        NeedSendEmail = false
                    });
                }
            }
        }

        public async Task RejectInvitation(int invitationId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroupInvitation> invitationSpec = new Specification<AssignmentGroupInvitation>();
            invitationSpec.Conditions.Add(agi => agi.Id == invitationId);
            invitationSpec.Includes = q => q.Include(agi => agi.ToMember)
                                            .ThenInclude(cm => cm.User)
                                            .Include(agi => agi.FromMember)
                                            .ThenInclude(cm => cm.User);

            AssignmentGroupInvitation invitation =  await _repository.GetAsync(invitationSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.InvitationNotFound);

            if (invitation.ToMember.User.Id != currentUser.Id)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.InvitationNotYours);
            }

            if (invitation.Status != AssignmentGroupInvitationStatus.Pending)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.InvitationAlreadyProcessed);
            }

            invitation.Status = AssignmentGroupInvitationStatus.Rejected;
            invitation.RespondedAt = DateTime.UtcNow;
            _repository.Update(invitation);
            await _repository.SaveChangesAsync();

            // Notify inviter that the invitation was rejected
            if (invitation.FromMember?.User != null)
            {
                Specification<AssignmentGroup> groupSpec = new();
                groupSpec.Conditions.Add(ag => ag.GroupInvitations.Any(i => i.Id == invitationId));
                AssignmentGroup? group = await _repository.GetAsync(groupSpec);

                AssignmentInClass? aic = await _repository.GetAsync<AssignmentInClass>(
                    a => a.AssignmentGroups.Any(g => g.GroupInvitations.Any(i => i.Id == invitationId)),
                    includes: q => q.Include(x => x.Class).Include(x => x.Assignment));

                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_invitation_rejected",
                    Data = new Dictionary<string, string>
                    {
                        { "userName", currentUser.DisplayName ?? string.Empty },
                        { "groupName", group?.Name ?? string.Empty },
                        { "className", aic?.Class?.Name ?? string.Empty }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { invitation.FromMember.User.Id },
                    LinkRedirect = aic?.Class != null && aic.Assignment != null
                        ? $"/class/{aic.Class.Id}/assignment-groups/{aic.Assignment.Id}"
                        : null,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }

        public async Task CancelInvitation(int invitationId)
        {
            User currentUser = await _currentUserService.GetCurrentUserInfo()
                ?? throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.UserNotLoggedIn);

            Specification<AssignmentGroupInvitation> invitationSpec = new Specification<AssignmentGroupInvitation>();
            invitationSpec.Conditions.Add(agi => agi.Id == invitationId);
            invitationSpec.Includes = q => q.Include(agi => agi.ToMember)
                                            .ThenInclude(cm => cm.User)
                                            .Include(agi => agi.FromMember)
                                            .ThenInclude(cm => cm.User);
            AssignmentGroupInvitation invitation =  await _repository.GetAsync(invitationSpec)
                ?? throw CustomException.WithKey(ExceptionCode.NotFound, ErrorKeys.InvitationNotFound);

            if (invitation.FromMember.User.Id != currentUser.Id)
            {
                throw CustomException.WithKey(ExceptionCode.Unauthorized, ErrorKeys.NotInvitationSender);
            }

            if (invitation.Status != AssignmentGroupInvitationStatus.Pending)
            {
                throw CustomException.WithKey(ExceptionCode.InternalServerError, ErrorKeys.InvitationAlreadyProcessed);
            }

            // Prepare notification data before deleting the invitation
            string groupName = string.Empty;
            int? classId = null;
            int? assignmentId = null;
            string className = string.Empty;
            if (invitation.ToMember?.User != null)
            {
                Specification<AssignmentGroup> groupSpec = new();
                groupSpec.Conditions.Add(ag => ag.GroupInvitations.Any(i => i.Id == invitationId));
                AssignmentGroup? group = await _repository.GetAsync(groupSpec);
                groupName = group?.Name ?? string.Empty;

                AssignmentInClass? aic = await _repository.GetAsync<AssignmentInClass>(
                    a => a.AssignmentGroups.Any(g => g.GroupInvitations.Any(i => i.Id == invitationId)),
                    includes: q => q.Include(x => x.Class).Include(x => x.Assignment));

                classId = aic?.Class?.Id;
                assignmentId = aic?.Assignment?.Id;
                className = aic?.Class?.Name ?? string.Empty;
            }

            _repository.Remove(invitation);
            await _repository.SaveChangesAsync();

            // Notify invited member that the invitation was canceled
            if (invitation.ToMember?.User != null)
            {
                await _notificationService.CreateNotification(new CreateNotificationRequest
                {
                    Type = "assignment_group_invitation_canceled",
                    Data = new Dictionary<string, string>
                    {
                        { "groupName", groupName },
                        { "className", className }
                    },
                    SenderId = currentUser.Id,
                    ReceiverIds = new List<int> { invitation.ToMember.User.Id },
                    LinkRedirect = classId.HasValue && assignmentId.HasValue
                        ? $"/class/{classId.Value}/assignment-groups/{assignmentId.Value}"
                        : null,
                    OpenNewTab = false,
                    NeedSendEmail = false
                });
            }
        }
    }
}