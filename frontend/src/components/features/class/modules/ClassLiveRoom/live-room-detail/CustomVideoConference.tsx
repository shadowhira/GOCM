/* eslint-disable react-hooks/exhaustive-deps */
import type {
  TrackReference,
  TrackReferenceOrPlaceholder,
  WidgetState,
} from "@livekit/components-core";
import {
  isEqualTrackRef,
  isTrackReference,
  isWeb,
} from "@livekit/components-core";
import { RoomEvent, Track } from "livekit-client";
import * as React from "react";
import type { MessageFormatter } from "@livekit/components-react";
import {
  ConnectionStateToast,
  FocusLayout,
  FocusLayoutContainer,
  LayoutContextProvider,
  RoomAudioRenderer,
} from "@livekit/components-react";
import {
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
} from "@livekit/components-react";
import { ControlBar } from "./CustomControllerBar";
import { ParticipantTile } from "./CustomParticipantTile";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { ChannelEventName } from "@/types/constants";
import {
  messageKeys,
  participantKeys,
  useGetLiveRoomParticipant,
} from "@/queries/liveRoomQueries";
import { useQueryClient } from "@tanstack/react-query";
import { GridLayout } from "./CustomGridLayout";
import { CarouselLayout } from "./CustomCarouselLayout";
import { ParticipantResponse } from "@/types/participant";
import { Chat } from "./CustomChat";
import { ChatBottomSheet } from "./ChatBottomSheet";
import { useParticipants } from "@livekit/components-react";
import { LiveRoomRewardBroadcast, RoomNotification } from "@/types/liveRoom";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
/**
 * Props for VideoConference component
 */
export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  chatMessageFormatter?: MessageFormatter;
  SettingsComponent?: React.ComponentType;
  liveRoomBroadcastChannel: string;
  liveRoomId: number;
  participant: ParticipantResponse;
  classId?: number;
}

/**
 * Custom hook to manage raised hand participants and sorted tracks
 */
const useSortedTracks = (
  tracks: TrackReferenceOrPlaceholder[],
  participants: ParticipantResponse[] | undefined,
  focusTrack: TrackReferenceOrPlaceholder | undefined
) => {
  return React.useMemo(() => {
    const raisedHandIdentities = new Set(
      participants
        ?.filter((p) => p.isRaisingHand)
        .map((p) => p.livekitIdentity) ?? []
    );

    const sortedTracks = [...tracks].sort((a, b) => {
      const aRaised = raisedHandIdentities.has(a.participant.identity);
      const bRaised = raisedHandIdentities.has(b.participant.identity);

      if (aRaised && !bRaised) return -1;
      if (bRaised && !aRaised) return 1;
      return 0;
    });

    const carouselTracks = sortedTracks.filter(
      (track) => !isEqualTrackRef(track, focusTrack)
    );

    return {
      raisedHandIdentities,
      sortedTracks,
      carouselTracks,
    };
  }, [
    participants,
    focusTrack?.publication?.trackSid,
    tracks
      .map(
        (t) =>
          `${t.participant.identity}_${t.source}_${
            t.publication?.trackSid || "placeholder"
          }`
      )
      .join(","),
  ]);
};

/**
 * Custom hook to manage screen share auto-focus logic
 */
const useScreenShareAutoFocus = (
  screenShareTracks: TrackReference[],
  focusTrack: TrackReferenceOrPlaceholder | undefined,
  tracks: TrackReferenceOrPlaceholder[],
  layoutContext: ReturnType<typeof useCreateLayoutContext>
) => {
  const lastAutoFocusedRef = React.useRef<TrackReferenceOrPlaceholder | null>(
    null
  );

  React.useEffect(() => {
    // Auto-focus on screen share
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedRef.current === null
    ) {
      console.log("Auto-focusing screen share:", screenShareTracks[0]);

      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });

      lastAutoFocusedRef.current = screenShareTracks[0];
      return;
    }

    // Auto-clear focus when screen share stops
    if (
      lastAutoFocusedRef.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedRef.current?.publication?.trackSid
      )
    ) {
      console.log("Auto-clearing screen share focus");

      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedRef.current = null;
      return;
    }

    // Update focus track if it's a placeholder
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updatedFocusTrack = tracks.find(
        (tr) =>
          tr.participant.identity === focusTrack.participant.identity &&
          tr.source === focusTrack.source
      );

      if (
        updatedFocusTrack &&
        updatedFocusTrack !== focusTrack &&
        isTrackReference(updatedFocusTrack)
      ) {
        layoutContext.pin.dispatch?.({
          msg: "set_pin",
          trackReference: updatedFocusTrack,
        });
      }
    }
  }, [
    screenShareTracks
      .map(
        (ref) => `${ref.publication.trackSid}_${ref.publication.isSubscribed}`
      )
      .join(),
    focusTrack?.publication?.trackSid,
  ]);

  return screenShareTracks.length > 0;
};

/**
 * Custom hook to manage Supabase realtime subscriptions
 */
const useRealtimeSubscription = (
  liveRoomBroadcastChannel: string,
  liveRoomId: number,
  queryClient: ReturnType<typeof useQueryClient>
) => {
  const [notifications, setNotifications] = React.useState<RoomNotification[]>(
    []
  );
  const t = useTranslations();

  // Utility functions để quản lý notifications
  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  React.useEffect(() => {
    console.log("Subscribing to room channel:", liveRoomBroadcastChannel);
    const channel: RealtimeChannel = supabase
      .channel(liveRoomBroadcastChannel)
      .on(
        "broadcast",
        { event: ChannelEventName.ParticipantRaiseHandUpdated },
        (payload) => {
          console.log("Raise hand event received:", payload);
          queryClient.invalidateQueries({
            queryKey: participantKeys.roomParticipants(liveRoomId),
          });
        }
      )
      .on("broadcast", { event: ChannelEventName.NewMessage }, (payload) => {
        console.log("Got new messages:", payload);
        queryClient.invalidateQueries({
          queryKey: messageKeys.roomMessages(liveRoomId),
        });
      })
      .on(
        "broadcast",
        { event: ChannelEventName.RoomNotification },
        (payload) => {
          console.log("Got new notifications:", payload);
          const broadcastMessage = payload.payload as RoomNotification;

          const newNotification: RoomNotification = {
            id: broadcastMessage.id,
            notification: broadcastMessage.notification,
            type: broadcastMessage.type,
            createdAt: broadcastMessage.createdAt,
          };

          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .on(
        "broadcast",
        { event: ChannelEventName.LiveRoomRewardGranted },
        (payload) => {
          const broadcast = payload.payload as LiveRoomRewardBroadcast;
          console.log("Reward granted event", broadcast);

          // Cập nhật điểm số của participant trong cache
          queryClient.setQueryData(
            participantKeys.roomParticipants(liveRoomId),
            (existing: ParticipantResponse[] | undefined) => {
              if (!existing) return existing;
              return existing.map((participant: ParticipantResponse) => {
                if (participant.id !== broadcast.participantId) {
                  return participant;
                }

                return {
                  ...participant,
                  classMember: {
                    ...participant.classMember,
                    points:
                      participant.classMember.points + broadcast.deltaPoints,
                  },
                };
              });
            }
          );

          const formattedDelta = broadcast.deltaPoints > 0
            ? `+${broadcast.deltaPoints}`
            : `${broadcast.deltaPoints}`;

          toast.success(
            t("live_room_reward_realtime_toast", {
              name: broadcast.targetDisplayName,
              delta: formattedDelta,
            })
          );
        }
      )
      // .on("broadcast", { event: ChannelEventName.PartipantJoinRoom }, (payload) => {
      //   console.log("Got new participant:", payload);
      //   queryClient.invalidateQueries({
      //      queryKey: participantKeys.roomParticipants(liveRoomId),
      //   });
      // })
      .subscribe((status) => {
        // console.log("Channel subscription status:", status);
      });

    return () => {
      // console.log("Cleaning up channel subscription");
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [liveRoomBroadcastChannel, liveRoomId, queryClient]);

  return {
    notifications,
    clearNotifications,
  };
};

/**
 * Video Conference Component
 *
 * Features:
 * - Focus on specific participants
 * - Grid view with pagination
 * - Screen sharing (one at a time)
 * - Auto-focus on screen share
 * - Raise hand functionality
 * - Real-time synchronization via Supabase
 * - View participants
 * - Responsive layout (mobile, tablet, desktop)
 */
export function CustomVideoConference({
  liveRoomBroadcastChannel,
  SettingsComponent,
  liveRoomId,
  participant,
  classId,
  ...props
}: VideoConferenceProps) {
  // Query management
  const queryClient = useQueryClient();
  const { data: participants } = useGetLiveRoomParticipant(liveRoomId);

  // Responsive layout hook
  const { isMobile, showSidebarChat, controlBarVariant, maxTilesPerPage, gridColumns } = useResponsiveLayout();

  // Widget state management
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });

  // Mobile chat bottom sheet state
  const [showMobileChat, setShowMobileChat] = React.useState(false);

  // Track management
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false }
  );

  const liveKitParticipants = useParticipants();
  // Invalidate khi participants thay đổi // Synchronizing
  React.useEffect(() => {
    console.log("Participants changed, refreshing...");
    queryClient.invalidateQueries({
      queryKey: participantKeys.roomParticipants(liveRoomId),
    });
  }, [liveKitParticipants.map((e) => e.identity).join(",")]);

  // Layout context
  const layoutContext = useCreateLayoutContext();
  const focusTrack = usePinnedTracks(layoutContext)?.[0];

  // Screen share tracks
  const screenShareTracks: TrackReference[] = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);

  // Custom hooks
  const { raisedHandIdentities, sortedTracks, carouselTracks } =
    useSortedTracks(tracks, participants, focusTrack);

  const isOnSharingScreen = useScreenShareAutoFocus(
    screenShareTracks,
    focusTrack,
    tracks,
    layoutContext
  );

  const {
    notifications,
    clearNotifications,
  } = useRealtimeSubscription(liveRoomBroadcastChannel, liveRoomId, queryClient);

  // Widget update callback - handles both sidebar chat and mobile chat
  const handleWidgetUpdate = React.useCallback((state: WidgetState) => {
    console.log("Updating widget state:", state, "isMobile:", isMobile);

    if (isMobile && state.showChat) {
      // On mobile, open bottom sheet instead of sidebar
      setShowMobileChat(true);
      setWidgetState({ ...state, showChat: false });
    } else {
      setWidgetState(state);
    }
  }, [isMobile]);

  // Handle mobile chat toggle from control bar
  const handleChatToggle = React.useCallback(() => {
    if (isMobile) {
      setShowMobileChat(prev => !prev);
    }
  }, [isMobile]);

  // Close mobile chat
  const handleCloseMobileChat = React.useCallback(() => {
    setShowMobileChat(false);
  }, []);

  // Calculate responsive focus layout grid template
  const focusLayoutGridTemplate = React.useMemo(() => {
    if (isMobile) {
      return "1fr"; // Full width on mobile, carousel below
    }
    return `${gridColumns === 2 ? "3fr 1fr" : "5fr 1fr"}`;
  }, [isMobile, gridColumns]);

  // Render helpers
  const renderLayout = () => {
    if (!focusTrack) {
      return (
        <div className="lk-grid-layout-wrapper">
          <GridLayout
            tracks={sortedTracks}
            maxTilesPerPage={maxTilesPerPage}
          >
            <ParticipantTile
              raisedHandParticipantIndentity={raisedHandIdentities}
            />
          </GridLayout>
        </div>
      );
    }

    return (
      <div className={`lk-focus-layout-wrapper ${isMobile ? 'lk-focus-layout-mobile' : ''}`}>
        <FocusLayoutContainer
          style={{
            gridTemplateColumns: focusLayoutGridTemplate,
            gridTemplateRows: isMobile ? "1fr auto" : undefined
          }}
        >
          <FocusLayout trackRef={focusTrack} />
          <CarouselLayout tracks={carouselTracks}>
            <ParticipantTile
              raisedHandParticipantIndentity={raisedHandIdentities}
            />
          </CarouselLayout>
        </FocusLayoutContainer>
      </div>
    );
  };

  if (!isWeb()) {
    return (
      <div className="lk-video-conference" {...props}>
        <RoomAudioRenderer />
        <ConnectionStateToast />
      </div>
    );
  }

  return (
    <div className="lk-video-conference" {...props}>
      <LayoutContextProvider
        value={layoutContext}
        onWidgetChange={handleWidgetUpdate}
      >
        <div className="lk-video-conference-inner">
          {renderLayout()}

          <ControlBar
            controls={{
              microphone: true,
              camera: true,
              chat: true,
              screenShare: !isMobile, // Disable screen share on mobile
              settings: !!SettingsComponent,
              isOnSharingScreen,
              liveRoomId,
              participantId: participant.id,
              notifications: notifications,
              clearNotifications: clearNotifications,
              participant: participant,
              classId: classId
            }}
            variant={controlBarVariant}
            onChatToggle={isMobile ? handleChatToggle : undefined}
          />
        </div>

        {/* Desktop/Tablet sidebar chat */}
        {showSidebarChat && (
          <Chat
            style={{ display: widgetState.showChat ? "grid" : "none" }}
            liveRoomId={liveRoomId}
            participantId={participant.id}
            classId={classId}
          />
        )}

        {/* Mobile chat bottom sheet */}
        {isMobile && (
          <ChatBottomSheet
            isOpen={showMobileChat}
            onClose={handleCloseMobileChat}
            liveRoomId={liveRoomId}
            participantId={participant.id}
            classId={classId}
          />
        )}

        {SettingsComponent && (
          <div
            className="lk-settings-menu-modal"
            style={{ display: widgetState.showSettings ? "block" : "none" }}
          >
            <SettingsComponent />
          </div>
        )}
      </LayoutContextProvider>

      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}
