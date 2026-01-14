import React from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import { CosmeticAvatar } from "@/components/features/cosmetics";
import type { SubmissionResponse } from "@/types/submission";
import { AssignmentGroupMemberResponse, AssignmentGroupResponse } from "@/types/assignmentGroup";
import {
  ClickableAvatarWrapper,
  type UserBasicInfo,
} from "@/components/features/user";

interface Props {
  submission: SubmissionResponse;
  assignmentGroup: AssignmentGroupResponse | undefined;
  groupMembers: AssignmentGroupMemberResponse[];
  leader: AssignmentGroupMemberResponse | undefined;
  isGroupSubmission: boolean;
  isExpanded: boolean;
  classId: number;
  t: (key: string) => string;
  toggleExpanded: (e: React.MouseEvent) => void;
  onAvatarClick?: (userInfo: UserBasicInfo) => void;
}

export function GroupSubmissionCardHeader({
  submission,
  assignmentGroup,
  groupMembers,
  leader,
  isGroupSubmission,
  isExpanded,
  classId,
  t,
  toggleExpanded,
  onAvatarClick,
}: Props): React.ReactElement {
  return (
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {isGroupSubmission ? (
        <>
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            {groupMembers.length > 0 && (
              <Badge
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs px-1"
              >
                {groupMembers.length}
              </Badge>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-foreground truncate">
                {assignmentGroup?.name || t("unknown_group")}
              </h3>
              {leader && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {t("leader")}: {leader.member.userName}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">
                {submission.submittedTime
                  ? format(
                      parseBackendDateTime(String(submission.submittedTime)) || new Date(submission.submittedTime),
                      "dd/MM/yyyy HH:mm",
                      {
                        locale: vi,
                      }
                    )
                  : t("not_submitted")}
              </span>
              {groupMembers.length > 0 && (
                <>
                  <span>•</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary hover:underline hover:bg-transparent"
                    onClick={toggleExpanded}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3 mr-1" />
                        {t("hide_members")}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3 mr-1" />
                        {t("show_members")} ({groupMembers.length})
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <ClickableAvatarWrapper onClick={(e) => {
            e.stopPropagation();
            onAvatarClick?.({
              id: submission.submitById!,
              displayName: submission.submitByName || t("unknown"),
              email: submission.submitByEmail || "",
              avatarUrl: submission.submitByAvatarUrl,
            });
          }}>
            <CosmeticAvatar
              classId={classId}
              classMemberId={submission.submitById}
              avatarUrl={submission.submitByAvatarUrl}
              displayName={submission.submitByName || t("unknown")}
              size="sm"
            />
          </ClickableAvatarWrapper>
          <div className="min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate">
              {submission.submitByName ||
                (submission.submitById
                  ? `${t("student")} #${submission.submitById}`
                  : t("unknown"))}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {submission.submitByEmail}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {submission.submittedTime
                ? format(
                    parseBackendDateTime(String(submission.submittedTime)) || new Date(submission.submittedTime),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: vi,
                    }
                  )
                : t("not_submitted")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
