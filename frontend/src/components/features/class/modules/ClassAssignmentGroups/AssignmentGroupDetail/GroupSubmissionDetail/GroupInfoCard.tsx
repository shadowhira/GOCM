"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Users, BookOpen, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AssignmentGroupResponse } from "@/types/assignmentGroup";
import type { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { cn } from "@/lib/utils";

interface GroupInfoCardProps {
  group: AssignmentGroupResponse;
  topic?: AssignmentGroupTopicResponse;
  className?: string;
}

export const GroupInfoCard = ({ group, topic, className }: GroupInfoCardProps) => {
  const t = useTranslations();

  return (
    <Card className={cn("p-4 sm:p-6", className)}>
      <div className="space-y-4">
        {/* Header: Group Name & Topic */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {group.name}
              </h3>
              {topic && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{topic.title}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="h-7">
              {group.groupMembers?.length || 0} {t("members")}
            </Badge>
          </div>
        </div>

        {/* Members List */}
        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            {t("group_members")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {group.groupMembers?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-md border bg-background"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.member.avatarUrl || ""} />
                  <AvatarFallback className="text-xs">
                    {member.member.userName?.[0] || member.member.userEmail[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">
                      {member.member.userName || member.member.userEmail}
                    </p>
                    {member.isLeader && (
                      <Crown className="w-3 h-3 text-warning shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.member.userEmail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
