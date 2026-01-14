"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Plus } from "lucide-react";
import {
  useGetAllAssignmentGroupTopics,
  useGetMyAssignmentGroup,
} from "@/queries/assignmentGroupTopicQueries";
import { useGetAssignmentById } from "@/queries/assignmentQueries";
import { AssignmentGroupStatus } from "@/types/assignmentGroup";
import { Button } from "@/components/ui/button";
import { GroupTopicManager } from "./GroupTopicManager";
import { GroupAssignmentSubmission } from "./GroupAssignmentSubmission";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { InvitationsNotification } from "./InvitationsNotification";


interface StudentGroupViewProps {
  assignmentId: number;
  classId: number;
}

export const StudentGroupView = ({
  assignmentId,
  classId,
}: StudentGroupViewProps) => {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isInvitationsOpen, setIsInvitationsOpen] = useState(false);
  const [hasProcessedInvitationParam, setHasProcessedInvitationParam] = useState(false);

  // Check for openInvitations query param from notification click
  const openInvitationsParam = searchParams.get("openInvitations");

  useEffect(() => {
    if (openInvitationsParam === "true" && !hasProcessedInvitationParam) {
      setIsInvitationsOpen(true);
      setHasProcessedInvitationParam(true);
      // Remove the query param from URL after opening
      const params = new URLSearchParams(searchParams.toString());
      params.delete("openInvitations");
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [openInvitationsParam, hasProcessedInvitationParam, searchParams, pathname, router]);

  const { data: topics, isLoading: topicsLoading } =
    useGetAllAssignmentGroupTopics(classId, assignmentId);

  const { data: myGroup, isLoading: groupLoading } = useGetMyAssignmentGroup(
    classId,
    assignmentId
  );

  const { data: assignment, refetch } = useGetAssignmentById(assignmentId);

  const hasGroup = !!myGroup;

  const selectedTopic = topics?.find((t) => t.id === selectedTopicId);
  const isTopicFull = selectedTopic
    ? (selectedTopic.assignmentGroups?.length || 0) >=
    selectedTopic.maxGroupsPerTopic
    : true;

  useEffect(() => {
    if (hasGroup && myGroup && myGroup.assignmentGroupTopicId) {
      // Nếu có group và group đã có topic, set selectedTopicId theo group's topic
      setSelectedTopicId(myGroup.assignmentGroupTopicId);
    }
  }, [hasGroup, myGroup]);

  const handleCreateGroup = (topicId: number) => {
    setSelectedTopicId(topicId);
    setIsCreateOpen(true);
  };



  if (topicsLoading || groupLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state when no topics available
  if (!topics || topics.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("no_topics_available")}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("no_topics_available_description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("group_topics")}</h2>
      </div> */}
      <div className="flex justify-end gap-2 empty:hidden">
        <InvitationsNotification
          classId={classId}
          assignmentId={assignmentId}
          externalOpen={isInvitationsOpen}
          onOpenChange={setIsInvitationsOpen}
        />
        {!hasGroup && (
          <Button
            onClick={() => selectedTopicId && handleCreateGroup(selectedTopicId)}
            disabled={!selectedTopicId || isTopicFull}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("create_group")}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <GroupTopicManager
          group={myGroup || undefined}
          topics={topics}
          selectedTopicId={selectedTopicId}
          onTopicChange={setSelectedTopicId}
          classId={classId}
          assignmentId={assignmentId}
        />
      </div>

      {hasGroup && assignment && myGroup.status === AssignmentGroupStatus.Approved && (
        <div className="w-full">
          <GroupAssignmentSubmission
            assignment={assignment}
            classId={classId}
            group={myGroup}
            onSubmissionComplete={() => refetch()}
          />
        </div>
      )}

      <CreateGroupDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        classId={classId}
        assignmentId={assignmentId}
      />


    </div>
  );
};
