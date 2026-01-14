import * as React from "react";
import { MessageResponse } from "@/types/liveRoom";
import { cn, formatLocalDateTime } from "@/lib/utils";
import {
  CosmeticAvatar,
  CosmeticBadge,
  CosmeticChatBubble,
} from "@/components/features/cosmetics";
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from "@/components/features/user";
import { RoleInClass } from "@/types/class";
export interface ChatEntryProps extends React.HTMLAttributes<HTMLLIElement> {
  /** The chat message object to display. */
  entry: MessageResponse;
  /** Hide sender name. Useful when displaying multiple consecutive chat messages from the same person. */
  hideName?: boolean;

  isLocal: boolean;
  classId?: number;
}

export const ChatEntry: (
  props: ChatEntryProps & React.RefAttributes<HTMLLIElement>
) => React.ReactNode = /* @__PURE__ */ React.forwardRef<
  HTMLLIElement,
  ChatEntryProps
>(function ChatEntry(
  { entry, hideName = false, isLocal, classId, ...props }: ChatEntryProps,
  ref
) {
  const time = new Date(entry.createdAt);
  const name = entry.displayName;

  // Của thành
  const member = entry.sentBy.classMember;
  const cosmetics = member.cosmetics ?? null;
  const {
    isOpen: isUserModalOpen,
    selectedUser,
    classContext,
    openModal: openUserModal,
    setIsOpen: setUserModalOpen,
  } = useUserDetailModal();

  const handleAvatarClick = () => {
    const userBasicInfo: UserBasicInfo = {
      id: member.userId,
      displayName: member.userName,
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    };
    const userClassContext: UserClassContext = {
      classId: classId ?? 0, // ClassId from parent context
      classMemberId: member.id,
      roleInClass: member.roleInClassValue as RoleInClass,
      roleInClassLabel: member.roleInClass,
      points: member.points ?? 0,
      enrollDate: member.enrollDate,
      cosmetics: member.cosmetics,
    };
    openUserModal(userBasicInfo, userClassContext);
  };

  return (
    <li
      ref={ref}
      className={cn(
        "lk-chat-entry flex w-full flex-col gap-1 px-2",
        isLocal
          ? "items-end lk-chat-entry-local"
          : "items-start lk-chat-entry-remote",
      )}
      title={time.toLocaleTimeString("vi-VN", { timeStyle: "full" })}
      data-lk-message-origin={isLocal ? "local" : "remote"}
      {...props}
      style={{ marginLeft: 0, marginRight: 0 }}
    >
      <div
        className={cn(
          "flex w-full max-w-[90%] items-start gap-2",
          isLocal && "flex-row-reverse"
        )}
      >
        <ClickableAvatarWrapper onClick={handleAvatarClick}>
          <CosmeticAvatar
            classId={classId}
            classMemberId={member.id}
            avatarUrl={member.avatarUrl}
            displayName={name}
            size="sm"
            cosmetics={cosmetics}
            className="self-start"
          />
        </ClickableAvatarWrapper>

        <CosmeticChatBubble
          classId={classId}
          classMemberId={member.id}
          cosmetics={cosmetics}
          align={isLocal ? "end" : "start"}
          header={
            hideName ? undefined : (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold">{name}</span>
                <CosmeticBadge
                  classId={classId}
                  classMemberId={member.id}
                  cosmetics={cosmetics}
                  size="sm"
                  fallbackLabel={member.roleInClass}
                  showWhenDisabled
                />
              </div>
            )
          }
          footer={
            <span className="text-xs opacity-80">
              {formatLocalDateTime(entry.createdAt)}
            </span>
          }
          className={cn("max-w-full", isLocal ? "text-right" : "text-left")}
        >
          <span className="whitespace-pre-wrap break-words text-sm">
            {entry.content}
          </span>
        </CosmeticChatBubble>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
        />
      )}
    </li>
  );
});
