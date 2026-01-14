"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ChannelEventName, ChannelName } from "@/types/constants";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/store/auth";
import { notificationKeys } from "@/queries/notificationQueries";

const Notifications = dynamic(() => import("./Notifications"), { ssr: false });
const LocaleSwitcher = dynamic(() => import("./LocaleSwitcher"), { ssr: false });
const ThemeSwitcher = dynamic(() => import("./ThemeSwitcher"), { ssr: false });
const UserMenu = dynamic(() => import("./UserMenu"), { ssr: false });
interface RightSectionProps {
  showMobileSearch: boolean;
  onMobileSearchToggle: () => void;
}

export const RightSection = ({
  showMobileSearch,
  onMobileSearchToggle,
}: RightSectionProps) => {
  const [isReceivedNewNoti, setIsReceivedNewNoti] = useState(false);

  useRealtimeSubscription(setIsReceivedNewNoti);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 lg:gap-2 flex-shrink-0">
      {/* Mobile Search Button - visible until md */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="p-1 sm:p-1.5 text-foreground hover:text-primary-700 hover:bg-primary-50 transition-colors"
          aria-label="Search"
          onClick={onMobileSearchToggle}
        >
          {showMobileSearch ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {/* Notifications */}
      <Notifications isReceivedNewNoti={isReceivedNewNoti} setIsReceivedNewNoti={setIsReceivedNewNoti}/>

      {/* Language Switcher - Hidden until lg on smaller screens */}
      <div className="hidden lg:block">
        <LocaleSwitcher />
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />

      {/* User Avatar Menu */}
      <UserMenu />
    </div>
  );
};

/**
 * Custom hook to manage Supabase realtime subscriptions
 */
const useRealtimeSubscription = (setIsReceiveNewNoti: (val: boolean) => void) => {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();


  React.useEffect(() => {
    // console.log("Subscribing to channel:", ChannelName.Common);
    const channel: RealtimeChannel = supabase
      .channel(ChannelName.Common)
      .on(
        "broadcast",
        { event: ChannelEventName.SystemNotification },
        (payload) => {
          console.log("Got new notifications:", payload);
          const receiverIds: number[] = payload.payload.receiverIds;
          if (receiverIds.includes(currentUser?.id ?? 0)) {
            setIsReceiveNewNoti(true);
            queryClient.invalidateQueries({
              queryKey: notificationKeys.all,
            });
          }
        }
      )

      .subscribe((status) => {
        // console.log("Channel subscription status:", status);
      });

    return () => {
      // console.log("Cleaning up channel subscription");
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);
};
