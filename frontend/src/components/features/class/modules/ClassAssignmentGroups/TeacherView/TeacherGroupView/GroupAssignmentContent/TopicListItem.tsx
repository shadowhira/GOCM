"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, BookOpen } from "lucide-react";
import type { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { AssignmentGroupApprovalStatus } from "@/types/assignmentGroup";

interface TopicListItemProps {
  topic: AssignmentGroupTopicResponse;
  onEdit: () => void;
  onDelete: () => void;
}

export const TopicListItem = ({
  topic,
  onEdit,
  onDelete,
}: TopicListItemProps) => {
  const t = useTranslations();
  const groupCount = topic.approvalRequests?.filter((request) => request.status !== AssignmentGroupApprovalStatus.Rejected)?.length || 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">{topic.title}</h3>
            </div>

            {topic.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {topic.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {t("members_range", {
                  min: topic.minMembers,
                  max: topic.maxMembers,
                })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t("max_groups_per_topic", { count: topic.maxGroupsPerTopic })}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {t("current_groups", { count: groupCount })}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={groupCount > 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
