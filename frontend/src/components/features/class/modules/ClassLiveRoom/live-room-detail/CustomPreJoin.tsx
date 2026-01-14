import type {
  CreateLocalTracksOptions,
  LocalAudioTrack,
  LocalTrack,
  LocalVideoTrack,
  TrackProcessor,
} from "livekit-client";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  // facingModeFromLocalTrack,
  Track,
  Mutex,
} from "livekit-client";
import * as React from "react";
import {
  MediaDeviceMenu,
  TrackToggle,
  ParticipantPlaceholder,
  usePersistentUserChoices,
} from "@livekit/components-react";
import type { LocalUserChoices } from "@livekit/components-core";
import { log } from "@livekit/components-core";
import { useTranslations } from "next-intl";

// NOTE: cOMPONENT ĐƯỢC LẤY Ý TƯỞNG TỪ LIVEKIT-PREJOIN COMPONENT NHƯNG THAY ĐỔI ĐỂ PHÙ HỢP VỚI NGHIỆP VỤ

/**
 * Props for the CustomPreJoin component.
 */
export interface PreJoinProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit" | "onError"> {
  /** Callback được gọi khi user submit form với thông tin đã chọn */
  onSubmit?: (values: LocalUserChoices) => void;
  /** Custom validation function, chỉ submit nếu validation pass */
  onValidate?: (values: LocalUserChoices) => boolean;
  /** Callback được gọi khi có lỗi xảy ra (ví dụ: không tìm thấy device) */
  onError?: (error: Error) => void;
  /** Giá trị mặc định cho form (username, device IDs, enabled states) */
  defaults?: Partial<LocalUserChoices>;
  /** Hiển thị debug info (user choices) ở dưới form */
  debug?: boolean;
  /** Có lưu user choices vào localStorage không */
  persistUserChoices?: boolean;
  /** Video processor để áp dụng effects (blur, filters, etc.) */
  videoProcessor?: TrackProcessor<Track.Kind.Video>;
}

/**
 * Hook to create and manage preview tracks independently (audio + video)
 * This prevents one track failure from affecting the other
 *
 * @param options - Cấu hình cho audio/video tracks
 * @param onError - Callback khi có lỗi
 * @returns Mảng các tracks đã tạo thành công
 */
function usePreviewTracks(
  options: CreateLocalTracksOptions,
  onError?: (err: Error) => void
) {
  // State lưu danh sách tracks (audio, video, hoặc cả hai)
  const [tracks, setTracks] = React.useState<LocalTrack[]>([]);

  // Mutex (mutual exclusion lock) để đảm bảo chỉ có 1 lần tạo tracks chạy cùng lúc
  // Tránh race condition khi options thay đổi nhanh
  const trackLock = React.useMemo(() => new Mutex(), []);

  React.useEffect(() => {
    let needsCleanup = false;
    let localTracks: LocalTrack[] = [];

    // Acquire lock trước khi tạo tracks
    trackLock.lock().then(async (unlock) => {
      //   try {
      //     if (options.audio || options.video) {
      //       localTracks = await createLocalTracks(options);

      //       if (needsCleanup) {
      //         localTracks.forEach((tr) => tr.stop());
      //       } else {
      //         setTracks(localTracks);
      //       }
      //     }
      //   } catch (e: unknown) {
      //     if (onError && e instanceof Error) {
      //       onError(e);
      //     } else {
      //       log.error(e);
      //     }
      //   } finally {
      //     unlock();
      //   }
      // });

      try {
        const trackPromises: Promise<LocalTrack | null>[] = [];

        // Create audio track independently
        if (options.audio) {
          const audioOptions =
            typeof options.audio === "object" ? options.audio : {};
          trackPromises.push(
            createLocalAudioTrack(audioOptions).catch((error) => {
              log.warn("Failed to create audio track:", error);
              onError?.(
                error instanceof Error ? error : new Error(String(error))
              );
              return null;
            })
          );
        }

        // Create video track independently
        if (options.video) {
          const videoOptions =
            typeof options.video === "object" ? options.video : {};
          trackPromises.push(
            createLocalVideoTrack(videoOptions).catch((error) => {
              log.warn("Failed to create video track:", error);
              onError?.(
                error instanceof Error ? error : new Error(String(error))
              );
              return null;
            })
          );
        }

        // Đợi TẤT CẢ promises hoàn thành (kể cả những cái fail)
        const results = await Promise.all(trackPromises);

        // Lọc bỏ các tracks null (những track tạo thất bại)
        localTracks = results.filter(
          (track): track is LocalTrack => track !== null
        );

        // Nếu component đã unmount trong lúc đợi
        if (needsCleanup) {
          // Dừng tất cả tracks để giải phóng camera/mic
          localTracks.forEach((track) => track.stop());
        } else {
          // Set tracks vào state để render
          setTracks(localTracks);
        }
      } catch (error) {
        log.error("Unexpected error creating tracks:", error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      } finally {
        //unlock mutex để tránh deadlock
        unlock();
      }
    });

    // Cleanup function: chạy khi component unmount hoặc dependencies thay đổi
    return () => {
      needsCleanup = true;
      // Dừng tất cả tracks đang chạy
      localTracks.forEach((track) => track.stop());
    };
  }, [JSON.stringify(options), onError, trackLock]); // Re-run khi options thay đổi

  return tracks;
}

/**
 * Custom PreJoin component with independent track creation
 * This fixes the issue where missing microphone causes camera to fail
 */
export function CustomPreJoin({
  defaults = {},
  onValidate,
  onSubmit,
  onError,
  debug = false,
  persistUserChoices = true,
  videoProcessor,
  ...htmlProps
}: PreJoinProps) {
  const t = useTranslations();
  // Persistent user choices
  const {
    userChoices: initialUserChoices,
    saveAudioInputDeviceId,
    saveAudioInputEnabled,
    saveVideoInputDeviceId,
    saveVideoInputEnabled,
    saveUsername,
  } = usePersistentUserChoices({
    defaults,
    preventSave: !persistUserChoices,
    preventLoad: !persistUserChoices,
  });

  // Local state
  const [audioEnabled, setAudioEnabled] = React.useState(
    initialUserChoices.audioEnabled
  );
  const [videoEnabled, setVideoEnabled] = React.useState(
    initialUserChoices.videoEnabled
  );
  const [audioDeviceId, setAudioDeviceId] = React.useState(
    initialUserChoices.audioDeviceId
  );
  const [videoDeviceId, setVideoDeviceId] = React.useState(
    initialUserChoices.videoDeviceId
  );
  const [username, setUsername] = React.useState(initialUserChoices.username);

  // Persist user choices - Mỗi khi setting thay đổi → tự động lưu vào localStorage
  React.useEffect(
    () => saveAudioInputEnabled(audioEnabled),
    [audioEnabled, saveAudioInputEnabled]
  );
  React.useEffect(
    () => saveVideoInputEnabled(videoEnabled),
    [videoEnabled, saveVideoInputEnabled]
  );
  React.useEffect(
    () => saveAudioInputDeviceId(audioDeviceId),
    [audioDeviceId, saveAudioInputDeviceId]
  );
  React.useEffect(
    () => saveVideoInputDeviceId(videoDeviceId),
    [videoDeviceId, saveVideoInputDeviceId]
  );
  React.useEffect(() => saveUsername(username), [username, saveUsername]);

  // Tạo audio + video tracks dựa trên settings hiện tại
  const tracks = usePreviewTracks(
    {
      // Chỉ tạo audio track nếu audioEnabled = true
      audio: audioEnabled ? { deviceId: audioDeviceId } : false,
      // Chỉ tạo video track nếu videoEnabled = true
      video: videoEnabled
        ? { deviceId: videoDeviceId, processor: videoProcessor }
        : false,
    },
    onError // Callback khi có lỗi (không tìm thấy device, etc.)
  );

  // Extract specific tracks
  const videoTrack = React.useMemo(
    () =>
      tracks.find((track) => track.kind === Track.Kind.Video) as
        | LocalVideoTrack
        | undefined,
    [tracks]
  );

  const audioTrack = React.useMemo(
    () =>
      tracks.find((track) => track.kind === Track.Kind.Audio) as
        | LocalAudioTrack
        | undefined,
    [tracks]
  );

  // Lấy facing mode của camera (front/back camera trên mobile)
  // const facingMode = React.useMemo(() => {
  //   if (!videoTrack) return "undefined";
  //   const { facingMode } = facingModeFromLocalTrack(videoTrack);
  //   return facingMode;
  // }, [videoTrack]);

  // Attach video track to video element
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.unmute();
      videoTrack.attach(videoRef.current);
    }

    return () => {
      videoTrack?.detach();
    };
  }, [videoTrack]);

  // Validation
  const handleValidation = React.useCallback(
    (values: LocalUserChoices) => {
      if (typeof onValidate === "function") {
        return onValidate(values);
      }
      return values.username !== "";
    },
    [onValidate]
  );

  const [isValid, setIsValid] = React.useState(false);

  React.useEffect(() => {
    const newUserChoices: LocalUserChoices = {
      username,
      videoEnabled,
      videoDeviceId,
      audioEnabled,
      audioDeviceId,
    };
    setIsValid(handleValidation(newUserChoices));
  }, [
    username,
    videoEnabled,
    videoDeviceId,
    audioEnabled,
    audioDeviceId,
    handleValidation,
  ]);

  // Handle form submission
  const handleSubmit = React.useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const userChoices: LocalUserChoices = {
        username,
        videoEnabled,
        videoDeviceId,
        audioEnabled,
        audioDeviceId,
      };

      if (handleValidation(userChoices)) {
        onSubmit?.(userChoices);
      } else {
        log.warn("Validation failed with:", userChoices);
      }
    },
    [
      username,
      videoEnabled,
      videoDeviceId,
      audioEnabled,
      audioDeviceId,
      handleValidation,
      onSubmit,
    ]
  );

  return (
    <div className="lk-prejoin" {...htmlProps}>
      {/* Video Preview */}
      <div className="lk-video-container">
        {videoTrack ? (
          <video
            ref={videoRef}
            width="1280"
            height="720"
            // data-lk-facing-mode={facingMode}
          />
        ) : (
          <div className="lk-camera-off-note">
            <ParticipantPlaceholder />
          </div>
        )}
      </div>

      {/* Device Controls */}
      <div className="lk-button-group-container">
        {/* Audio Controls */}
        <div className="lk-button-group audio">
          <TrackToggle
            initialState={audioEnabled}
            source={Track.Source.Microphone}
            onChange={setAudioEnabled}
          >
            {t("live_room_prejoin_mic_label")}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              initialSelection={audioDeviceId}
              kind="audioinput"
              disabled={!audioTrack}
              tracks={{ audioinput: audioTrack }}
              onActiveDeviceChange={(_, id) => setAudioDeviceId(id)}
            />
          </div>
        </div>

        {/* Video Controls */}
        <div className="lk-button-group video">
          <TrackToggle
            initialState={videoEnabled}
            source={Track.Source.Camera}
            onChange={setVideoEnabled}
          >
            {t("live_room_prejoin_cam_label")}
          </TrackToggle>
          <div className="lk-button-group-menu">
            <MediaDeviceMenu
              initialSelection={videoDeviceId}
              kind="videoinput"
              disabled={!videoTrack}
              tracks={{ videoinput: videoTrack }}
              onActiveDeviceChange={(_, id) => setVideoDeviceId(id)}
            />
          </div>
        </div>
      </div>

      {/* Username Form */}
      <form className="lk-username-container" onSubmit={handleSubmit}>
        <input
          className="lk-form-control"
          id="username"
          name="username"
          type="text"
          value={username}
          placeholder={t("live_room_prejoin_user_label")}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          disabled
        />
        <button
          className="lk-button lk-join-button"
          type="submit"
          disabled={!isValid}
        >
          {t("live_room_prejoin_join_button")}
        </button>
      </form>

      {/* Debug Info */}
      {debug && (
        <div>
          <strong>User Choices:</strong>
          <ul
            className="lk-list"
            style={{ overflow: "hidden", maxWidth: "15rem" }}
          >
            <li>Username: {username}</li>
            <li>Video Enabled: {String(videoEnabled)}</li>
            <li>Audio Enabled: {String(audioEnabled)}</li>
            <li>Video Device: {videoDeviceId}</li>
            <li>Audio Device: {audioDeviceId}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
