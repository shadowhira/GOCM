/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
"use client";
import {
  LocalUserChoices,
  // PreJoin
} from "@livekit/components-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useCurrentUser } from "@/store/auth";
import { useCurrentTheme } from "@/store/theme/useThemeStore";
import { ConnectionDetails, JoinRoomResponse } from "@/types/liveRoom";
import { CustomPreJoin } from "./CustomPreJoin";
import { CustomVideoConference } from "./CustomVideoConference";
import {
  Room,
  RoomConnectOptions,
  RoomEvent,
  RoomOptions,
  TrackPublishDefaults,
  VideoCaptureOptions,
  VideoPresets,
} from "livekit-client";
import { RoomContext } from "@livekit/components-react";
import { useJoinRoom, useGetLiveRoomById } from "@/queries/liveRoomQueries";
import { useGetClassById } from "@/queries/classQueries";
import { useSetClassAppearanceSettings } from "@/store";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParticipantResponse } from "@/types/participant";
import { getApiErrorMessage } from "@/lib/api-error";

interface LiveRoomProps {
  liveRoomId: number;
}

export default function LiveRoomDetail({ liveRoomId }: LiveRoomProps) {
  const t = useTranslations();
  const currentUser = useCurrentUser();
  const theme = useCurrentTheme();
  const liveKitTheme = useMemo(
    () => (theme === "dark" ? "ocm-dark" : "ocm-light"),
    [theme]
  );

  const joinRoom = useJoinRoom();
  const { data: liveRoomData } = useGetLiveRoomById(liveRoomId);
  
  // Fetch class data to get appearance settings
  const classId = liveRoomData?.classId ?? 0;
  const { data: classData } = useGetClassById(classId);
  const setClassAppearanceSettings = useSetClassAppearanceSettings();
  
  // Hydrate appearance settings into cosmetics store
  useEffect(() => {
    if (classId && classData?.appearanceSettings) {
      setClassAppearanceSettings(classId, classData.appearanceSettings);
    }
  }, [classId, classData?.appearanceSettings, setClassAppearanceSettings]);

  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);

  const preJoinDefaults = useMemo(() => {
    return {
      username: currentUser?.displayName,
      videoEnabled: true,
      audioEnabled: true,
    };
  }, [currentUser?.displayName]);

  const [connectionDetails, setConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);

  const [participant, setParticipant] = useState<ParticipantResponse | undefined>(undefined);

  const handlePreJoinSubmit = useCallback(async (values: LocalUserChoices) => {
    try {
      setPreJoinChoices(values);
      const payload = {
        liveRoomId,
      };
      const res = (await joinRoom.mutateAsync(payload)) as JoinRoomResponse;
      const newDetails = {
        serverUrl: res.livekitServerUrl,
        roomName: res.roomName,
        participantName: currentUser?.displayName ?? "",
        participantToken: res.accessToken,
        liveRoomBroadcastChannel: res.liveRoomBroadcastChannel
      };

      setConnectionDetails(newDetails);

      setParticipant(res.participant);
      console.log(res.participant);
      console.log(newDetails);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("error_occurred"), t));
    }
  }, []);
  const handlePreJoinError = useCallback((e: any) => console.error(e), []);

  return (
    <>
      <main data-lk-theme={liveKitTheme} style={{ height: "100vh" }}>
        {connectionDetails === undefined || preJoinChoices === undefined || participant === undefined ? (
          <div
            style={{ display: "grid", placeItems: "center", height: "100%" }}
          >
            <CustomPreJoin
              defaults={preJoinDefaults}
              onSubmit={handlePreJoinSubmit}
              onError={handlePreJoinError}
              // onValidate={onValidate}
              persistUserChoices={false}
              debug={false}
            />
          </div>
        ) : (
          <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          liveRoomId={liveRoomId}
          participant={participant}
          classId={liveRoomData?.classId}
          />
        )}
      </main>
    </>
  );
}

function VideoConferenceComponent(props: {
  participant: ParticipantResponse
  liveRoomId: number,
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  classId?: number;
}) {
  const roomOptions = useMemo((): RoomOptions => {
    const videoCaptureDefaults: VideoCaptureOptions = {
      deviceId: props.userChoices.videoDeviceId ?? undefined,
      resolution: VideoPresets.h1080,
    };

    // [VideoPresets.h540, VideoPresets.h216]
    const publishDefaults: TrackPublishDefaults = {
      dtx: false,
      videoSimulcastLayers: [VideoPresets.h1080, VideoPresets.h720],
      videoCodec: "vp9",
    };

    return {
      videoCaptureDefaults,
      publishDefaults,
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: true,
      dynacast: true,
    };
  }, [props.userChoices]);
  const room = useMemo(() => new Room(roomOptions), []);

  const connectOptions = useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave);
    room.on(RoomEvent.MediaDevicesError, handleError);

    room
      .connect(
        props.connectionDetails.serverUrl,
        props.connectionDetails.participantToken,
        connectOptions
      )
      .catch((error) => {
        handleError(error);
      });
    if (props.userChoices.videoEnabled) {
      room.localParticipant.setCameraEnabled(true).catch((error) => {
        handleError(error);
      });
    }
    if (props.userChoices.audioEnabled) {
      room.localParticipant.setMicrophoneEnabled(true).catch((error) => {
        handleError(error);
      });
    }
    return () => {
      room.off(RoomEvent.Disconnected, handleOnLeave);
      room.off(RoomEvent.MediaDevicesError, handleError);
    };
  }, [room, props.connectionDetails, props.userChoices]);


  const handleOnLeave = useCallback(async () => {
    await room.localParticipant.setCameraEnabled(false);
    await room.localParticipant.setMicrophoneEnabled(false);
    await room.localParticipant.setScreenShareEnabled(false);

    // Disconnect room
    await room.disconnect();
    
    // Redirect về trang live-room của class
    if (props.classId) {
      window.location.href = `/class/${props.classId}/live-room`;
    } else {
      window.location.href = "/";
    }
  }, [props.classId]);
  const handleError = useCallback((error: Error) => {
    console.error(`Encountered an unexpected error when joining room: ${error.message}`);
  }, []);


  return (
    <div className="lk-room-container">
      <RoomContext.Provider value={room}>
        {/* <KeyboardShortcuts /> */}
        <CustomVideoConference
        liveRoomBroadcastChannel={props.connectionDetails.liveRoomBroadcastChannel}
        liveRoomId={props.liveRoomId}
        participant={props.participant}
        classId={props.classId}
        // chatMessageFormatter={formatChatMessageLinks}
        // SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
        />
        {/* <DebugMode /> */}
        {/* <RecordingIndicator /> */}
      </RoomContext.Provider>
    </div>
  );
}
