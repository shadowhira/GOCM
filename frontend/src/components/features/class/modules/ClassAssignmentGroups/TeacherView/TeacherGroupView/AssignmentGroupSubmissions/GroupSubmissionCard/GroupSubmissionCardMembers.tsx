import React from "react";
import { Badge } from "@/components/ui/badge";
import { CosmeticAvatar } from "@/components/features/cosmetics";
import { AssignmentGroupMemberResponse } from "@/types/assignmentGroup";
import {
  ClickableAvatarWrapper,
  type UserBasicInfo,
} from "@/components/features/user";

interface Props {
  groupMembers: AssignmentGroupMemberResponse[];
  classId: number;
  t: (key: string) => string;
  onAvatarClick?: (userInfo: UserBasicInfo) => void;
}

export function GroupSubmissionCardMembers({ groupMembers, classId, t, onAvatarClick }: Props): React.ReactElement | null {
  if (!groupMembers.length) return null;
  return (
    <div className="border-t bg-muted/5 p-3">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("group_members")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {groupMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 rounded-md bg-background border"
            >
              <ClickableAvatarWrapper onClick={() => {
                onAvatarClick?.({
                  id: member.member.userId,
                  displayName: member.member.userName || t("unknown"),
                  email: member.member.userEmail || "",
                  avatarUrl: member.member.avatarUrl,
                });
              }}>
                <CosmeticAvatar
                  classId={classId}
                  classMemberId={member.member.id}
                  avatarUrl={member.member.avatarUrl}
                  displayName={member.member.userName || t("unknown")}
                  size="sm"
                />
              </ClickableAvatarWrapper>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium truncate">
                    {member.member.userName}
                  </p>
                  {member.isLeader && (
                    <Badge variant="default" className="text-xs h-4 px-1">
                      {t("leader")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {member.member.userEmail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
