/* eslint-disable design-system/use-design-tokens */
/* eslint-disable design-system/no-hardcoded-colors */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMaybeLayoutContext } from "@livekit/components-react";
import { ChatToggle } from "@livekit/components-react";
import { ChatCloseIcon } from "@livekit/components-react";
import { useGetLiveRoomMessages } from "@/queries/liveRoomQueries";
import { ChatEntry } from "./CustomChatEntry";
// import { useLocalParticipant } from "@livekit/components-react";
import { useSendMessage } from "@/queries/liveRoomQueries";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/store/auth";
export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
  liveRoomId: number;
  participantId: number;
  classId?: number;
}

export const Chat = React.memo(function Chat({
  liveRoomId,
  participantId,
  classId,
  ...props
}: ChatProps) {
  const t = useTranslations();
  const ulRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const user = useCurrentUser();
  // const localParticipant = useLocalParticipant();
  const sendMessageMutation = useSendMessage();
  const { data: rawChatMessages } = useGetLiveRoomMessages(liveRoomId);
  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = React.useRef<number>(0);

  // Memoize chat messages to prevent unnecessary recalculations
  const chatMessages = React.useMemo(() => {
    return rawChatMessages ?? [];
  }, [rawChatMessages]);

  // const localIdentity = React.useMemo(() => {
  //   return localParticipant.localParticipant.identity;
  // }, [localParticipant.localParticipant.identity]);

  // Memoize handleSubmit to prevent recreation
  const handleSubmit = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (inputRef.current && inputRef.current.value.trim() !== "") {
        const payload = {
          liveRoomId,
          content: inputRef.current.value,
          participantId,
        };
        try {
          await sendMessageMutation.mutateAsync(payload);
          inputRef.current.value = "";
          inputRef.current.focus();
        } catch (err: any) {
          console.error("Failed to send message:", err);
        }
      }
    },
    [liveRoomId, participantId, sendMessageMutation]
  );

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    if (ulRef.current) {
      ulRef.current.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [chatMessages.length]); // Only trigger when length changes

  // Handle unread message count
  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) {
      return;
    }

    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMessageTimestamp = new Date(lastMessage.createdAt).getTime();

    // If chat is open, mark all as read
    if (layoutContext.widget.state?.showChat && chatMessages.length > 0) {
      if (lastReadMsgAt.current !== lastMessageTimestamp) {
        lastReadMsgAt.current = lastMessageTimestamp;
      }
      return;
    }

    // Calculate unread messages
    const unreadMessageCount = chatMessages.filter((msg) => {
      const msgTimestamp = new Date(msg.createdAt).getTime();
      return !lastReadMsgAt.current || msgTimestamp > lastReadMsgAt.current;
    }).length;

    // Update unread count if changed
    const { widget } = layoutContext;
    if (
      unreadMessageCount > 0 &&
      widget.state?.unreadMessages !== unreadMessageCount
    ) {
      widget.dispatch?.({ msg: "unread_msg", count: unreadMessageCount });
    }
  }, [chatMessages.length, layoutContext?.widget.state?.showChat]); // Optimize dependencies

  // Memoize event handlers
  const handleInput = React.useCallback((ev: React.FormEvent) => {
    ev.stopPropagation();
  }, []);

  const handleKeyDown = React.useCallback((ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }, []);

  const handleKeyUp = React.useCallback((ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }, []);

  return (
    <>
      <div {...props} className="lk-chat">
        <div className="lk-chat-header">
          {t("live_room_chat_messages_title")}
          {layoutContext && (
            <ChatToggle className="lk-close-button">
              <ChatCloseIcon />
            </ChatToggle>
          )}
        </div>
        <ul
          className="
            lk-list lk-chat-messages
            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:rounded-full


            [&::-webkit-scrollbar-track]:bg-gray-300
            [&::-webkit-scrollbar-thumb]:bg-gray-400
            hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
          "
          ref={ulRef}
        >
          {chatMessages.map((msg, idx, allMsg) => {
            const prevMsg = idx >= 1 ? allMsg[idx - 1] : null;

            // Hide name if previous message from same sender or gap < 1m
            const hideName =
              idx >= 1 &&
              (prevMsg?.sentBy?.classMember.userId ===
                msg.sentBy?.classMember.userId && prevMsg
                ? new Date(msg.createdAt).getTime() -
                    new Date(prevMsg.createdAt).getTime() <
                  60_000
                : false);

            return (
              <ChatEntry
                key={msg.id}
                hideName={hideName}
                entry={msg}
                isLocal={user?.id === msg.sentBy.classMember.userId}
                classId={classId}
              />
            );
          })}
        </ul>
        {/* <div className="flex align-middle justify-center lk-button-group-container">
          <button className="lk-button">Tin nhắn phòng</button>
          <button className="lk-button">Tin nhắn hệ thống</button>
        </div> */}
        <form className="lk-chat-form" onSubmit={handleSubmit}>
          <input
            className="lk-form-control lk-chat-form-input"
            ref={inputRef}
            type="text"
            placeholder={t("live_room_chat_placeholder")}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
          />
          <button type="submit" className="lk-button lk-chat-form-button">
            {t("live_room_chat_send")}
          </button>
        </form>
      </div>
    </>
  );
});
