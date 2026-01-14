"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useRouterWithProgress } from "@/hooks/useRouterWithProgress";
import { useUIStore } from "@/store/ui/useUIStore";
import { useTranslations } from "next-intl";
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Video,
  FileText,
  Users,
  ShoppingBag,
  Settings,
  NotebookTabs,
} from "lucide-react";
import { useGetUnsubmittedCountByUserInClass } from "@/queries/assignmentQueries";

interface SidebarItem {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  translationKey: string;
  href: string;
  badge?: number;
}

interface ClassSidebarProps {
  classId: string;
}

export const ClassSidebar = ({ classId }: ClassSidebarProps) => {
  const router = useRouterWithProgress();
  const pathname = usePathname();
  const { sidebarOpen, setCurrentModule } = useUIStore();
  const t = useTranslations();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch số lượng assignment chưa nộp của user trong class
  const { data: unsubmittedCountResponse } = useGetUnsubmittedCountByUserInClass(
    parseInt(classId)
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine if sidebar should show expanded content
  // On mobile: only when explicitly toggled open
  // On desktop: when toggled open OR hovered (if not explicitly toggled)
  const showExpanded = isMobile ? sidebarOpen : sidebarOpen || isHovered;

  const assignmentCount = unsubmittedCountResponse?.assignmentUnsubmittedCount ?? 0;
  const groupAssignmentCount = unsubmittedCountResponse?.groupAssignmentUnsubmittedCount ?? 0;

  const sidebarItems: SidebarItem[] = [
    {
      key: "posts",
      icon: MessageSquare,
      translationKey: "sidebar_posts",
      href: `/class/${classId}`,
    },
    {
      key: "assignments",
      icon: BookOpen,
      translationKey: "sidebar_assignments",
      href: `/class/${classId}/assignments`,
      badge: assignmentCount > 0 ? assignmentCount : undefined,
    },
    {
      key: "group-assignments",
      icon: NotebookTabs,
      translationKey: "sidebar_group_assignments",
      href: `/class/${classId}/assignment-groups`,
      badge: groupAssignmentCount > 0 ? groupAssignmentCount : undefined,
    },
    {
      key: "grades",
      icon: GraduationCap,
      translationKey: "sidebar_grades",
      href: `/class/${classId}/grades`,
    },
    {
      key: "live-class",
      icon: Video,
      translationKey: "sidebar_live_room",
      href: `/class/${classId}/live-room`,
    },
    {
      key: "documents",
      icon: FileText,
      translationKey: "sidebar_documents",
      href: `/class/${classId}/documents`,
    },
    {
      key: "members",
      icon: Users,
      translationKey: "sidebar_members",
      href: `/class/${classId}/members`,
    },
    {
      key: "store",
      icon: ShoppingBag,
      translationKey: "sidebar_store",
      href: `/class/${classId}/store`,
    },
    {
      key: "settings",
      icon: Settings,
      translationKey: "sidebar_settings",
      href: `/class/${classId}/settings`,
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    setCurrentModule(item.key);
    router.push(item.href);
  };

  const isActiveItem = (item: SidebarItem) => {
    if (item.key === "posts") {
      return (
        pathname === `/class/${classId}` ||
        pathname === `/en/class/${classId}` ||
        pathname === `/vi/class/${classId}`
      );
    }
    return pathname.includes(item.href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 bg-card border-r border-border transition-all duration-300 ease-in-out shadow-lg",
        // Mobile: Positioned below header when open, hidden when closed
        isMobile && !sidebarOpen && "hidden",
        isMobile && sidebarOpen && "top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-64 z-50",
        // Desktop: Always visible, positioned below header
        !isMobile && "top-16 h-[calc(100vh-4rem)] md:block",
        !isMobile && (showExpanded ? "md:w-64 md:z-50" : "md:w-16 md:z-40")
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Content */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item);

            return (
              <Button
                key={item.key}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full justify-start gap-3 h-10 relative overflow-hidden transition-colors",
                  isActive &&
                    "bg-primary-600 text-white shadow-sm hover:bg-primary-700",
                  !isActive &&
                    "text-foreground hover:bg-muted hover:text-foreground",
                  !showExpanded && "px-2"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "flex-1 text-left transition-opacity duration-200",
                    showExpanded ? "opacity-100" : "opacity-0"
                  )}
                >
                  {t(item.translationKey)}
                </span>
                {item.badge && showExpanded && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
