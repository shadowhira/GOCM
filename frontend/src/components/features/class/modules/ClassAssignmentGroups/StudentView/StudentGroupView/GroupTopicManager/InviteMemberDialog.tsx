"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, Loader2, Users, X } from "lucide-react";
import { useGetClassMembers } from "@/queries/classQueries";
import { useInviteMemberToAssignmentGroup } from "@/queries/assignmentGroupQueries";
import { useGetAllAssignmentGroupsByAssignment } from "@/queries/assignmentGroupQueries";
import { useCancelInvitation } from "@/queries/assignmentGroupInvitationQueries";
import type { AssignmentGroupResponse } from "@/types/assignmentGroup";

interface InviteMemberDialogProps {
  classId: number;
  assignmentId: number;
  group: AssignmentGroupResponse;
}

export const InviteMemberDialog = ({
  classId,
  assignmentId,
  group,
}: InviteMemberDialogProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: classMembers, isLoading } = useGetClassMembers(classId);
  const { data: allGroups } = useGetAllAssignmentGroupsByAssignment(classId, assignmentId);
  const inviteMutation = useInviteMemberToAssignmentGroup();
  const cancelInvitationMutation = useCancelInvitation();

  // Get member IDs who are in current group
  const currentGroupMemberIds = new Set(
    group.groupMembers?.map((m) => m.member.userId) || []
  );

  // Get member IDs who have pending invitations from current group
  const pendingInvitationIds = new Set(
    group.groupInvitations?.filter((inv) => inv.status === 0).map((inv) => inv.toMember.id) || []
  );

  // Get member IDs who are in other groups
  const membersInOtherGroups = new Set<number>();
  allGroups?.forEach((otherGroup) => {
    if (otherGroup.id !== group.id) {
      otherGroup.groupMembers?.forEach((member) => {
        membersInOtherGroups.add(member.member.userId);
      });
    }
  });

  // Filter and categorize members
  const filteredMembers = classMembers?.filter((member) => {
    const isTeacher = member.roleInClass === "Teacher";
    const matchesSearch = 
      member.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return !isTeacher && matchesSearch;
  });

  const getMemberStatus = (memberId: number, memberClassMemberId: number) => {
    if (currentGroupMemberIds.has(memberId)) {
      return "in_current_group";
    }
    if (pendingInvitationIds.has(memberClassMemberId)) {
      return "invited";
    }
    if (membersInOtherGroups.has(memberId)) {
      return "in_other_group";
    }
    return "available";
  };

  const handleInvite = (memberId: number) => {
    inviteMutation.mutate(
      {
        assignmentGroupId: group.id,
        memberId,
      },
      {
        onSuccess: () => {
          // Don't close dialog, just update the list
        },
      }
    );
  };

  const handleCancelInvitation = (invitationId: number) => {
    cancelInvitationMutation.mutate({
      invitationId,
      classId,
      assignmentId,
    });
  };

  // Get invitation ID for a specific member
  const getInvitationId = (memberClassMemberId: number): number | undefined => {
    const invitation = group.groupInvitations?.find(
      (inv) => inv.status === 0 && inv.toMember.id === memberClassMemberId
    );
    return invitation?.id;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{t("invite_member")}</span>
          <span className="sm:hidden">{t("invite")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("invite_member_to_group")}</DialogTitle>
          <DialogDescription>
            {t("search_and_invite_members_description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search_by_name_or_email")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-invite-list overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredMembers && filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const status = getMemberStatus(member.userId, member.id);
                
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={member.avatarUrl || ""} />
                        <AvatarFallback>
                          {member.userName?.[0] || member.userEmail[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.userName || member.userEmail}
                        </p>
                        {member.userName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {member.userEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {status === "in_current_group" ? (
                        <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                          <Users className="w-3 h-3" />
                          {t("in_group")}
                        </Badge>
                      ) : status === "invited" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const invitationId = getInvitationId(member.id);
                            if (invitationId) {
                              handleCancelInvitation(invitationId);
                            }
                          }}
                          disabled={cancelInvitationMutation.isPending}
                          className="gap-1"
                        >
                          <X className="w-3 h-3" />
                          <span className="hidden sm:inline">{t("cancel_invitation")}</span>
                          <span className="sm:hidden">{t("cancel")}</span>
                        </Button>
                      ) : status === "in_other_group" ? (
                        <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                          <Users className="w-3 h-3" />
                          {t("has_group")}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleInvite(member.id)}
                          disabled={inviteMutation.isPending}
                        >
                          {t("invite")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">
                  {searchQuery
                    ? t("no_members_found")
                    : t("no_available_members")}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
