import { Track } from "livekit-client";
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  MediaDeviceMenu,
  TrackToggle,
  ChatIcon,
  LeaveIcon,
  ScreenShareIcon,
  ChatToggle,
  useLocalParticipantPermissions,
  usePersistentUserChoices,
  StartMediaButton,
  useLocalParticipant,
} from "@livekit/components-react";
import { supportsScreenSharing } from "@livekit/components-core";
import { Hand } from "lucide-react";
import { toast } from "sonner";
import { useEndLiveRoom, useRaiseHand } from "@/queries/liveRoomQueries";
import {
  CreateRoomNotification,
  RemoveParticipantRequest,
  RoomNotification,
  RoomNotificationType,
  UpdateParticipantRaiseHandRequest,
} from "@/types/liveRoom";
import ParticipantList from "./ParticipantList";
import { RoomNotifications } from "./RoomNotification";
import { useRemoveParticipant } from "@/queries/liveRoomQueries";
import { useCreateRoomNotification } from "@/queries/liveRoomQueries";
import { ParticipantResponse } from "@/types/participant";
import { MonitorX } from "lucide-react";
import { RoleInClass } from "@/types/class";
// ========== TYPES ==========

export interface ControlBarControls {
  microphone?: boolean;
  camera?: boolean;
  chat?: boolean;
  screenShare?: boolean;
  settings?: boolean;
  isOnSharingScreen?: boolean;
  liveRoomId: number;
  participantId: number;
  notifications: RoomNotification[];
  participant: ParticipantResponse;
  clearNotifications: () => void;
  classId?: number;
}

export type ControlBarVariation = "minimal" | "verbose" | "textOnly";
export type ControlBarVariant = "full" | "compact" | "minimal";

export interface ControlBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  variation?: ControlBarVariation;
  controls: ControlBarControls;
  saveUserChoices?: boolean;
  /** Responsive variant: 'full' shows all controls, 'compact' shows icon-only */
  variant?: ControlBarVariant;
  /** Custom handler for chat toggle (used on mobile) */
  onChatToggle?: () => void;
}

// ========== CONSTANTS ==========

const TRACK_SOURCE_PROTOCOL_MAP: Record<Track.Source, number> = {
  [Track.Source.Camera]: 1,
  [Track.Source.Microphone]: 2,
  [Track.Source.ScreenShare]: 3,
  [Track.Source.ScreenShareAudio]: 4,
  [Track.Source.Unknown]: 0,
};

const MEDIA_CONTROL_LABEL_KEYS: Record<
  Track.Source.Microphone | Track.Source.Camera,
  string
> = {
  [Track.Source.Microphone]: "live_room_control_microphone",
  [Track.Source.Camera]: "live_room_control_camera",
};

// ========== UTILITIES ==========

const trackSourceToProtocol = (source: Track.Source): number => {
  return TRACK_SOURCE_PROTOCOL_MAP[source] ?? 0;
};

// ========== HOOKS ==========

const useVisibleControls = (
  controls: ControlBarControls,
  localPermissions: ReturnType<typeof useLocalParticipantPermissions>
): Required<ControlBarControls> => {
  return React.useMemo(() => {
    const defaultControls: Required<ControlBarControls> = {
      microphone: false,
      camera: false,
      chat: false,
      screenShare: false,
      settings: false,
      isOnSharingScreen: false,
      liveRoomId: controls.liveRoomId,
      participantId: controls.participantId,
      notifications: controls.notifications,
      clearNotifications: controls.clearNotifications,
      participant: controls.participant,
      classId: controls.classId ?? 0,
    };

    if (!localPermissions) {
      return defaultControls;
    }

    const canPublishSource = (source: Track.Source): boolean => {
      if (!localPermissions.canPublish) return false;

      const allowedSources = localPermissions.canPublishSources;
      return (
        allowedSources.length === 0 ||
        allowedSources.includes(trackSourceToProtocol(source))
      );
    };

    return {
      ...defaultControls,
      camera: controls.camera ?? canPublishSource(Track.Source.Camera),
      microphone:
        controls.microphone ?? canPublishSource(Track.Source.Microphone),
      screenShare:
        controls.screenShare ?? canPublishSource(Track.Source.ScreenShare),
      chat:
        controls.chat ?? (localPermissions.canPublishData && !!controls.chat),
      isOnSharingScreen: controls.isOnSharingScreen ?? false,
    };
  }, [controls, localPermissions]);
};

// ========== COMPONENTS ==========

interface MediaControlProps {
  source: Track.Source.Microphone | Track.Source.Camera;
  deviceKind: "audioinput" | "videoinput";
  onDeviceError?: ControlBarProps["onDeviceError"];
  onEnabledChange: (enabled: boolean, isUserInitiated: boolean) => void;
  onDeviceChange: (deviceId: string) => void;
}

const MediaControl = React.memo<MediaControlProps>(function MediaControl({
  source,
  deviceKind,
  onDeviceError,
  onEnabledChange,
  onDeviceChange,
}) {
  const t = useTranslations();
  const labelKey = MEDIA_CONTROL_LABEL_KEYS[source];
  const label = t(labelKey);
  return (
    <div className="lk-button-group">
      <TrackToggle
        source={source}
        showIcon={true}
        onChange={onEnabledChange}
        onDeviceError={(error) => onDeviceError?.({ source, error })}
        aria-label={label}
        title={label}
      >
        <span className="sr-only">{label}</span>
      </TrackToggle>
      <div className="lk-button-group-menu">
        <MediaDeviceMenu
          kind={deviceKind}
          onActiveDeviceChange={(_, deviceId) =>
            onDeviceChange(deviceId ?? "default")
          }
        />
      </div>
    </div>
  );
});

interface ScreenShareControlProps {
  isOnSharingScreen: boolean;
  onDeviceError?: ControlBarProps["onDeviceError"];
  createRoomNotification: (type: RoomNotificationType) => void;
}

const ScreenShareControl = React.memo<ScreenShareControlProps>(
  function ScreenShareControl({
    isOnSharingScreen,
    onDeviceError,
    createRoomNotification,
  }) {
    const t = useTranslations();
    const startLabel = t("live_room_control_share_screen");
    const stopLabel = t("live_room_control_stop_share_screen");
    const blockedLabel = t("live_room_control_screen_share_blocked");
    const { localParticipant } = useLocalParticipant();
    const isScreenSharing = localParticipant.isScreenShareEnabled;
    // localParticipant.

    const handleBlockedClick = React.useCallback(() => {
      toast.error(blockedLabel);
    }, [blockedLabel]);

    const handleChange = React.useCallback((enable: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        console.log("Debug:", enable)
        createRoomNotification(
          enable
            ? RoomNotificationType.StartShareScreen
            : RoomNotificationType.StopShareScreen
        );
      }
    }, []);

    // Nếu có người đang share và user này không share
    if (isOnSharingScreen && !isScreenSharing) {
      return (
        <button
          className="lk-button"
          onClick={handleBlockedClick}
          title={blockedLabel}
          aria-label={blockedLabel}
        >
          <ScreenShareIcon />
          <span className="sr-only">{blockedLabel}</span>
        </button>
      );
    }
    const buttonLabel = isScreenSharing ? stopLabel : startLabel;
    return (
      <TrackToggle
        onChange={handleChange}
        source={Track.Source.ScreenShare}
        captureOptions={{ audio: true, selfBrowserSurface: "include" }}
        showIcon={true}
        onDeviceError={(error) =>
          onDeviceError?.({ source: Track.Source.ScreenShare, error })
        }
        aria-label={buttonLabel}
        title={buttonLabel}
      >
        <span className="sr-only">{buttonLabel}</span>
      </TrackToggle>
    );
  }
);

const ChatControl = React.memo(function ChatControl({
  onChatToggle,
}: {
  onChatToggle?: () => void;
}) {
  const t = useTranslations();
  const label = t("live_room_control_chat");

  // If custom handler provided (mobile), use button instead of ChatToggle
  if (onChatToggle) {
    return (
      <button
        className="lk-button"
        onClick={onChatToggle}
        aria-label={label}
        title={label}
      >
        <ChatIcon />
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <ChatToggle aria-label={label} title={label}>
      <ChatIcon />
      <span className="sr-only">{label}</span>
    </ChatToggle>
  );
});

const LeaveControl = React.memo(function LeaveControl({
  leaveRoomHandler,
}: {
  leaveRoomHandler: () => void;
}) {
  const t = useTranslations();
  const label = t("live_room_control_leave");
  return (
    <>
      {/* <DisconnectButton>
        <LeaveIcon /> {label}
      </DisconnectButton> */}
      <button
        className="lk-disconnect-button"
        onClick={leaveRoomHandler}
        aria-label={label}
        title={label}
      >
        <LeaveIcon />
        <span className="sr-only">{label}</span>
      </button>
    </>
  );
});

const EndRoomControl = React.memo(function EndRoomControl({
  endRoomHandler,
}: {
  endRoomHandler: () => void;
}) {
  const t = useTranslations();
  const label = t("live_room_end");
  return (
    <>
      <button
        className="lk-disconnect-button"
        onClick={endRoomHandler}
        aria-label={label}
        title={label}
      >
        <MonitorX size={16} />
        <span className="sr-only">{label}</span>
      </button>
    </>
  );
});

interface RaiseHandControlProps {
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

const RaiseHandControl = React.memo<RaiseHandControlProps>(
  function RaiseHandControl({ isEnabled, onEnabledChange }) {
    const t = useTranslations();
    const raiseLabel = t("live_room_control_raise_hand");
    const lowerLabel = t("live_room_control_lower_hand");
    const handleClick = React.useCallback(() => {
      onEnabledChange(!isEnabled);
    }, [isEnabled, onEnabledChange]);

    return (
      <button
        className="lk-button"
        data-lk-enabled="true"
        onClick={handleClick}
        title={isEnabled ? lowerLabel : raiseLabel}
        aria-label={isEnabled ? lowerLabel : raiseLabel}
      >
        {isEnabled ? <Hand color="#ffb700" /> : <Hand />}
        <span className="sr-only">{isEnabled ? lowerLabel : raiseLabel}</span>
      </button>
    );
  }
);

// ========== MAIN COMPONENT ==========

export function ControlBar({
  controls,
  saveUserChoices = true,
  onDeviceError,
  variant = "full",
  onChatToggle,
  ...props
}: ControlBarProps) {
  const [isRaisingHand, setIsRaisingHand] = React.useState(false);

  const raiseHand = useRaiseHand();
  const removeParticipant = useRemoveParticipant();
  const localPermissions = useLocalParticipantPermissions();
  const endLiveRoom = useEndLiveRoom();

  const visibleControls = useVisibleControls(controls, localPermissions);
  const browserSupportsScreenSharing = supportsScreenSharing();

  const createRoomNotification = useCreateRoomNotification();

  const {
    saveAudioInputEnabled,
    saveVideoInputEnabled,
    saveAudioInputDeviceId,
    saveVideoInputDeviceId,
  } = usePersistentUserChoices({ preventSave: !saveUserChoices });

  // Memoize callbacks để tránh re-render
  const handleMicrophoneChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveAudioInputEnabled(enabled);
      }
    },
    [saveAudioInputEnabled]
  );

  const handleCameraChange = React.useCallback(
    (enabled: boolean, isUserInitiated: boolean) => {
      if (isUserInitiated) {
        saveVideoInputEnabled(enabled);
      }
    },
    [saveVideoInputEnabled]
  );

  const handleRaiseHandChange = React.useCallback(
    async (enabled: boolean) => {
      setIsRaisingHand(enabled);

      const payload: UpdateParticipantRaiseHandRequest = {
        liveRoomId: controls.liveRoomId,
        participantId: controls.participantId,
        isRaisingHand: enabled,
      };

      try {
        await raiseHand.mutateAsync(payload);
      } catch (error) {
        console.error("Failed to update raise hand status:", error);
        setIsRaisingHand(!enabled);
      }
    },
    [controls.liveRoomId, controls.participantId, raiseHand]
  );

  const handleCreateRoomNotification = React.useCallback(
    async (type: RoomNotificationType) => {
      const payload: CreateRoomNotification = {
        type,
        participantId: controls.participantId,
        liveRoomId: controls.liveRoomId,
      };
      try {
        await createRoomNotification.mutateAsync(payload);
      } catch (error) {
        console.error("Failed to create room notification:", error);
      }
    },
    [controls.liveRoomId, controls.participantId, createRoomNotification]
  );

  const handleLeaveRoom = React.useCallback(async () => {
    const payload: RemoveParticipantRequest = {
      liveRoomId: controls.liveRoomId,
      participantId: controls.participantId,
    };
    try {
      await removeParticipant.mutateAsync(payload);
    } catch (error) {
      console.error("Failed to leave-room:", error);
    }
  }, [controls.liveRoomId, controls.participantId, removeParticipant]);

  const handleEndLiveRoom = React.useCallback(async () => {
    try {
      await endLiveRoom.mutateAsync(controls.liveRoomId);
    } catch (error) {
      console.error("Failed to end-room:", error);
    }
  }, [controls.liveRoomId, endLiveRoom]);

  const isCompact = variant === "compact";

  return (
    <div
      className={`lk-control-bar ${isCompact ? "lk-control-bar-compact" : ""}`}
      data-variant={variant}
      {...props}
    >
      {visibleControls.microphone && (
        <MediaControl
          source={Track.Source.Microphone}
          deviceKind="audioinput"
          onDeviceError={onDeviceError}
          onEnabledChange={handleMicrophoneChange}
          onDeviceChange={saveAudioInputDeviceId}
        />
      )}

      {visibleControls.camera && (
        <MediaControl
          source={Track.Source.Camera}
          deviceKind="videoinput"
          onDeviceError={onDeviceError}
          onEnabledChange={handleCameraChange}
          onDeviceChange={saveVideoInputDeviceId}
        />
      )}

      {visibleControls.screenShare && browserSupportsScreenSharing && (
        <ScreenShareControl
          isOnSharingScreen={visibleControls.isOnSharingScreen}
          onDeviceError={onDeviceError}
          createRoomNotification={handleCreateRoomNotification}
        />
      )}

      {visibleControls.chat && <ChatControl onChatToggle={onChatToggle} />}

      <RaiseHandControl
        isEnabled={isRaisingHand}
        onEnabledChange={handleRaiseHandChange}
      />

      {/* Hide less important controls in compact mode */}
      {!isCompact && (
        <>
          <ParticipantList
            liveRoomId={controls.liveRoomId}
            participantId={controls.participantId}
            participant={controls.participant}
            classId={controls.classId}
          />

          <RoomNotifications
            notifications={controls.notifications}
            clearNotifications={controls.clearNotifications}
          />
        </>
      )}
      <LeaveControl leaveRoomHandler={handleLeaveRoom} />

      {controls.participant.classMember.roleInClassValue ===
        RoleInClass.TEACHER && (
        <EndRoomControl endRoomHandler={handleEndLiveRoom} />
      )}

      <StartMediaButton />
    </div>
  );
}
