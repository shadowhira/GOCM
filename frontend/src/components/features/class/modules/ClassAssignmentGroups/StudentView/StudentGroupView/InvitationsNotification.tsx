"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";
import {
  useGetMyAssignmentGroupInvitations,
  useAcceptAssignmentGroupInvitation,
  useRejectAssignmentGroupInvitation,
} from "@/queries/assignmentGroupInvitationQueries";
import {
  AssignmentGroupInvitationStatus,
  type AssignmentGroupInvitationResponse,
} from "@/types/assignmentGroupInvitation";
import { format } from "date-fns/format";

interface InvitationsNotificationProps {
  classId: number;
  assignmentId: number;
  /** External control for open state (optional) */
  externalOpen?: boolean;
  /** Callback when dialog closes (optional) */
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger button when using external control */
  hideTrigger?: boolean;
}

export const InvitationsNotification = ({
  classId,
  assignmentId,
  externalOpen,
  onOpenChange,
  hideTrigger = false,
}: InvitationsNotificationProps) => {
  const t = useTranslations();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isControlled = externalOpen !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;

  const setIsOpen = (open: boolean) => {
    if (isControlled) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const { data: invitations, isLoading } =
    useGetMyAssignmentGroupInvitations(classId, assignmentId);

  const acceptMutation = useAcceptAssignmentGroupInvitation();
  const rejectMutation = useRejectAssignmentGroupInvitation();

  const pendingInvitations = invitations?.filter(
    (inv: AssignmentGroupInvitationResponse) =>
      inv.status === AssignmentGroupInvitationStatus.Pending
  );

  const handleAccept = (invitationId: number) => {
    acceptMutation.mutate(
      {
        classId,
        assignmentId,
        invitationId,
      },
      {
        onSuccess: () => {
          // Close modal after successfully accepting invitation
          setIsOpen(false);
        },
      }
    );
  };

  const handleReject = (invitationId: number) => {
    rejectMutation.mutate({
      classId,
      assignmentId,
      invitationId,
    });
  };

  const hasInvitations = pendingInvitations && pendingInvitations.length > 0;

  // If using only as a modal (hideTrigger=true), don't show anything when loading
  if (isLoading && hideTrigger) {
    return null;
  }

  return (
    <>
      {!hideTrigger && hasInvitations && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative"
        >
          <UserPlus className="w-4 h-4" />
          {hasInvitations && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {pendingInvitations.length}
            </Badge>
          )}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="overflow-y-auto rounded-lg"
          style={{
            width: "calc(100vw - 2rem)",
            maxWidth: "42rem",
            maxHeight: "85vh",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Bell className="w-5 h-5" />
              {t("group_invitations")}
              {pendingInvitations && pendingInvitations.length > 0 && (
                <Badge variant="secondary">{pendingInvitations.length}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {!pendingInvitations || pendingInvitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("no_pending_invitations_description")}
                </p>
              </div>
            ) : (
              pendingInvitations.map(
                (invitation: AssignmentGroupInvitationResponse) => {
                  const isAccepting =
                    acceptMutation.isPending &&
                    acceptMutation.variables?.invitationId === invitation.id;
                  const isRejecting =
                    rejectMutation.isPending &&
                    rejectMutation.variables?.invitationId === invitation.id;

                  return (
                    <div
                      key={invitation.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                        <Avatar className="w-12 h-12 shrink-0 border">
                          <AvatarImage
                            src={invitation.fromMember.avatarUrl || ""}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {invitation.fromMember.userName?.[0] ||
                              invitation.fromMember.userEmail[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {invitation.fromMember.userName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {invitation.fromMember.userEmail}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t("invited_you_to_join_group", {})}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(invitation.sentAt),
                              "hh:mm aa, MMMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAccept(invitation.id)}
                          disabled={isAccepting || isRejecting}
                          className="h-9 px-3 flex-1 sm:flex-initial"
                        >
                          {isAccepting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t("accept")}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(invitation.id)}
                          disabled={isAccepting || isRejecting}
                          className="h-9 px-3 flex-1 sm:flex-initial"
                        >
                          {isRejecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              {t("reject")}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
