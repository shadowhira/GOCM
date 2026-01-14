import * as React from "react";
import {
  UseParticipantsOptions,
  useGridLayout,
  useSwipe,
  TrackLoop,
} from "@livekit/components-react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import { PaginationControl } from "./PaginationControl";
import { PaginationIndicator } from "./PaginationIndicator";
import useLivekitPagination from "@/hooks/useCustomLiveKitPagination";
/** @public */
export interface GridLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<UseParticipantsOptions, "updateOnlyOn"> {
  children: React.ReactNode;
  tracks: TrackReferenceOrPlaceholder[];
  /** Override max tiles per page for responsive layouts */
  maxTilesPerPage?: number;
}

/**
 * The `GridLayout` component displays the nested participants in a grid where every participants has the same size.
 * It also supports pagination if there are more participants than the grid can display.
 * @remarks
 * To ensure visual stability when tiles are reordered due to track updates,
 * uses the `useVisualStableUpdate` hook.
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <GridLayout tracks={tracks}>
 *     <ParticipantTile />
 *   </GridLayout>
 * <LiveKitRoom>
 * ```
 * @public
 */
export function GridLayout({ tracks, maxTilesPerPage, ...props }: GridLayoutProps) {

  const gridEl = React.createRef<HTMLDivElement>();

  const elementProps = React.useMemo(() => {
    return { ...props, className: "lk-grid-layout" };
  }, [props]);
  const { layout } = useGridLayout(gridEl as React.RefObject<HTMLDivElement>, tracks.length); // Customize grid layout using options in 3rd params
  
  // Use responsive maxTilesPerPage if provided, otherwise use layout's default
  const effectiveMaxTiles = maxTilesPerPage ?? layout.maxTiles;
  const pagination = useLivekitPagination(effectiveMaxTiles, tracks);

  useSwipe(gridEl as React.RefObject<HTMLDivElement>, {
    onLeftSwipe: pagination.nextPage,
    onRightSwipe: pagination.prevPage,
  });

  return (
    <div
      ref={gridEl}
      data-lk-pagination={pagination.totalPageCount > 1}
      {...elementProps}
      className="lk-grid-layout"
    >
      <TrackLoop tracks={tracks}>{props.children}</TrackLoop>
      {tracks.length > effectiveMaxTiles && (
        <>
          <PaginationIndicator
            totalPageCount={pagination.totalPageCount}
            currentPage={pagination.currentPage}
          />
          <PaginationControl pagesContainer={gridEl as React.RefObject<HTMLDivElement>} {...pagination} />
        </>
      )}
    </div>
  );
}
