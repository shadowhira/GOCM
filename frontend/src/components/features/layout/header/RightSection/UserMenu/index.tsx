"use client"

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";
import { Settings, LogOut } from "lucide-react";
import { useCurrentUser } from "@/store/auth";
import { SettingsModal, SettingsTab } from "./settings/SettingsModal";
import { useLogout } from "@/queries/authQueries";
import { useRouterWithProgress } from "@/hooks/useRouterWithProgress";

const UserMenu = () => {
  const t = useTranslations();
  const user = useCurrentUser();
  const router = useRouterWithProgress();
  const logoutMutation = useLogout();

  // Hash-driven modal state per COMPLEX_COMPONENTS_GUIDE
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash.startsWith("settings")) {
        setOpen(true);
        const parts = hash.split("/");
        const tab = (parts[1] as SettingsTab) || "profile";
        setActiveTab(tab);
      } else {
        setOpen(false);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const openSettings = () => {
    window.location.hash = "settings/profile";
  };

  const closeSettings = () => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch {
      // noop; errors handled globally or can add toast here
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-1 flex-shrink-0">
            <Avatar className="h-8 w-8">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl || ""}
                  alt={user.displayName || "User avatar"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="bg-primary-500 text-white flex items-center justify-center text-sm font-medium w-full h-full rounded-full">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {user && (
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user.displayName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}

          {/* Keep only Settings per requirement */}
          <DropdownMenuItem onClick={openSettings} className="gap-2 hover:text-primary-700 hover:bg-primary-50 transition-colors">
            <Settings className="h-4 w-4" />
            {t("settings")}
          </DropdownMenuItem>

          {/* Logout action */}
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="gap-2 hover:text-destructive hover:bg-destructive/15 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {logoutMutation.isPending ? t("signing_out") : t("sign_out")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal open={open} onClose={closeSettings} activeTab={activeTab} />
    </>
  );
};

export default UserMenu;