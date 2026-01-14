/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useMaybeLayoutContext } from "@livekit/components-react";
import { useGetLiveRoomMessages, useSendMessage } from "@/queries/liveRoomQueries";
import { ChatEntry } from "./CustomChatEntry";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/store/auth";
import { X } from "lucide-react";

export interface ChatBottomSheetProps {
  liveRoomId: number;
  participantId: number;
  isOpen: boolean;
  onClose: () => void;
  classId?: number;
}

/**
 * ChatBottomSheet - Mobile-friendly chat panel as bottom sheet
 * Used on mobile/tablet viewports instead of sidebar chat
 */
export const ChatBottomSheet = React.memo(function ChatBottomSheet({
  liveRoomId,
  participantId,
  isOpen,
  onClose,
  classId,
}: ChatBottomSheetProps) {
  const t = useTranslations();
  const ulRef = React.useRef<HTMLUListElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const user = useCurrentUser();
  
  const sendMessageMutation = useSendMessage();
  const { data: rawChatMessages } = useGetLiveRoomMessages(liveRoomId);
  const layoutContext = useMaybeLayoutContext();
  const lastReadMsgAt = React.useRef<number>(0);

  // Touch handling for swipe to close
  const touchStartY = React.useRef<number>(0);
  const touchCurrentY = React.useRef<number>(0);

  const chatMessages = React.useMemo(() => {
    return rawChatMessages ?? [];
  }, [rawChatMessages]);

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
    if (ulRef.current && isOpen) {
      ulRef.current.scrollTo({ top: ulRef.current.scrollHeight });
    }
  }, [chatMessages.length, isOpen]);

  // Handle unread message count
  React.useEffect(() => {
    if (!layoutContext || chatMessages.length === 0) {
      return;
    }

    const lastMessage = chatMessages[chatMessages.length - 1];
    const lastMessageTimestamp = new Date(lastMessage.createdAt).getTime();

    if (isOpen && chatMessages.length > 0) {
      if (lastReadMsgAt.current !== lastMessageTimestamp) {
        lastReadMsgAt.current = lastMessageTimestamp;
      }
      return;
    }

    const unreadMessageCount = chatMessages.filter((msg) => {
      const msgTimestamp = new Date(msg.createdAt).getTime();
      return !lastReadMsgAt.current || msgTimestamp > lastReadMsgAt.current;
    }).length;

    const { widget } = layoutContext;
    if (
      unreadMessageCount > 0 &&
      widget.state?.unreadMessages !== unreadMessageCount
    ) {
      widget.dispatch?.({ msg: "unread_msg", count: unreadMessageCount });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages.length, isOpen, layoutContext]);

  // Touch handlers for swipe-to-close
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
    const diff = touchCurrentY.current - touchStartY.current;
    
    // Only allow downward swipe on the handle area
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${Math.min(diff, 200)}px)`;
    }
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    const diff = touchCurrentY.current - touchStartY.current;
    
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    
    // Close if swiped down more than 100px
    if (diff > 100) {
      onClose();
    }
    
    touchStartY.current = 0;
    touchCurrentY.current = 0;
  }, [onClose]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Event handlers
  const handleInput = React.useCallback((ev: React.FormEvent) => {
    ev.stopPropagation();
  }, []);

  const handleKeyDown = React.useCallback((ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }, []);

  const handleKeyUp = React.useCallback((ev: React.KeyboardEvent) => {
    ev.stopPropagation();
  }, []);

  const handleBackdropClick = React.useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`lk-chat-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        className={`lk-chat-bottom-sheet ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t("live_room_chat_messages_title")}
      >
        {/* Handle for swipe */}
        <div 
          className="lk-chat-bottom-sheet-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Header */}
        <div className="lk-chat-bottom-sheet-header">
          <span className="font-medium text-lg">
            {t("live_room_chat_messages_title")}
          </span>
          <button 
            onClick={onClose}
            className="lk-button p-2 hover:bg-[var(--lk-bg4)] rounded-lg transition-colors"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Chat Content */}
        <div className="lk-chat-bottom-sheet-content">
          <ul className="lk-list lk-chat-messages p-4" ref={ulRef}>
            {chatMessages.map((msg, idx, allMsg) => {
              const prevMsg = idx >= 1 ? allMsg[idx - 1] : null;

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
        </div>
        
        {/* Input Form */}
        <form className="lk-chat-form m-4 mt-0" onSubmit={handleSubmit}>
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

export default ChatBottomSheet;
