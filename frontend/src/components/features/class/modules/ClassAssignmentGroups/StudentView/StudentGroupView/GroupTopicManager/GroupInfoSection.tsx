import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Crown, MoreVertical, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { InviteMemberDialog } from "./InviteMemberDialog";
import {
  AssignmentGroupApprovalStatus,
  AssignmentGroupMemberResponse,
  AssignmentGroupResponse,
  AssignmentGroupStatus,
} from "@/types/assignmentGroup";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/store/auth/useAuthStore";
import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { ApprovalRequestAction } from "./ApprovalRequestAction";
import { format } from "date-fns";

interface GroupInfoSectionProps {
  group: AssignmentGroupResponse | undefined;
  classId: number;
  assignmentId: number;
  selectedTopic?: AssignmentGroupTopicResponse | undefined;
  handleTransferLeadership: (member: AssignmentGroupMemberResponse) => void;
  handleOpenRemoveDialog: (member: AssignmentGroupMemberResponse) => void;
}

export const GroupInfoSection = ({
  group,
  classId,
  assignmentId,
  selectedTopic,
  handleTransferLeadership,
  handleOpenRemoveDialog,
}: GroupInfoSectionProps) => {
  const t = useTranslations();
  const user = useCurrentUser();

  const currentUserMember = group?.groupMembers?.find(
    (m) => m.member.userId === user?.id
  );
  const isCurrentUserLeader = currentUserMember?.isLeader || false;
  const canInviteMembers = isCurrentUserLeader &&
    group &&
    group.status !== AssignmentGroupStatus.PendingApproval &&
    group.status !== AssignmentGroupStatus.Approved;

  const isApproved = group?.status === AssignmentGroupStatus.Approved;

  // Get rejection reason from latest rejected approval request
  const getLatestRejectionReason = () => {
    if (!group) return null;

    const latestRejectedRequest = group.approvalRequests
      ?.filter((req) => req.status === AssignmentGroupApprovalStatus.Rejected)
      ?.sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      )[0];

    return latestRejectedRequest?.rejectReason || null;
  };

  return (
    <>
      {group && (
        <>
          {/* Show rejection reason from latest rejected approval request */}
          {getLatestRejectionReason() && !isApproved && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-1">
                {t("rejection_reason")}
              </p>
              <p className="text-sm text-muted-foreground">
                {getLatestRejectionReason()}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">
                {t("group_members")} ({group.groupMembers?.length || 0})
              </h3>
              {canInviteMembers && (
                <InviteMemberDialog
                  classId={classId}
                  assignmentId={assignmentId}
                  group={group}
                />
              )}
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {group.groupMembers?.map((member) => {
                const isCurrentUser = member.member.userId === user?.id;
                const canManage = isCurrentUserLeader && !isCurrentUser;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 border-2 border-background">
                        <AvatarImage src={member.member.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.member.userName?.[0]?.toUpperCase() ||
                            member.member.userEmail[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {member.member.userName || member.member.userEmail}
                          </p>
                          {member.isLeader && (
                            <Badge
                              variant="default"
                              className="gap-1 px-2 py-0"
                            >
                              <Crown className="w-3 h-3" />
                              {t("leader")}
                            </Badge>
                          )}
                          {isCurrentUser && (
                            <Badge variant="outline" className="px-2 py-0">
                              {t("you")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.member.userEmail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("joined_on")}: {format(new Date(member.joinedAt), "hh:mm aa, MMMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!member.isLeader && (
                            <DropdownMenuItem
                              onClick={() => handleTransferLeadership(member)}
                            >
                              <UserCog className="w-4 h-4 mr-2" />
                              {t("transfer_leadership")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleOpenRemoveDialog(member)}
                            className="text-destructive focus:text-destructive"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            {t("remove_member")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <ApprovalRequestAction
            group={group}
            selectedTopic={selectedTopic}
            isCurrentUserLeader={isCurrentUserLeader}
          />
        </>
      )}
    </>
  );
};
