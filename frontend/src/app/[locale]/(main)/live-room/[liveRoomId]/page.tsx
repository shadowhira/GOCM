import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import LiveRoomLoader from "@/components/features/class/modules/ClassLiveRoom/live-room-detail/LiveRoomLoader";
import "@livekit/components-styles";
import type { Metadata } from "next";
import { liveRoomApi } from "@/api/liveRoomApi";
import { getTranslations } from "next-intl/server";
import { getServerQueryClient } from "@/lib/serverQueryClient";
import { liveRoomKeys } from "@/queries/liveRoomQueries";

interface LiveRoomDetailProps {
  params: Promise<{
    locale: string;
    liveRoomId: string;
  }>;
}

export async function generateMetadata({
  params,
}: LiveRoomDetailProps): Promise<Metadata> {
  const { locale, liveRoomId } = await params;
  const t = await getTranslations({ locale });

  try {
    const liveRoom = await liveRoomApi.getById(parseInt(liveRoomId));
    return {
      title: t("live_room_metadata_title", { name: liveRoom.title }),
      description: t("live_room_metadata_description", { name: liveRoom.title }),
    };
  } catch {
    return {
      title: t("live_room_metadata_title_fallback"),
      description: t("live_room_metadata_description_fallback"),
    };
  }
}

export default async function LiveRoomDetailPage({params} : LiveRoomDetailProps) {
  const {liveRoomId} = await params;
  const liveRoomIdNum = parseInt(liveRoomId);

  // SSR with TanStack Query - prefetch live room detail
  const queryClient = getServerQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: liveRoomKeys.detail(liveRoomIdNum),
      queryFn: () => liveRoomApi.getById(liveRoomIdNum),
    });
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch live room detail:', error);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LiveRoomLoader liveRoomId={liveRoomIdNum}/>
    </HydrationBoundary>
  );
}
