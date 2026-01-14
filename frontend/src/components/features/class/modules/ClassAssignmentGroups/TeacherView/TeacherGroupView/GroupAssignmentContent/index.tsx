"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  useGetAllAssignmentGroupTopics,
  useDeleteAssignmentGroupTopic,
} from "@/queries/assignmentGroupTopicQueries";
import { TopicListItem } from "./TopicListItem";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { EditTopicDialog } from "./EditTopicDialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { useTopicHashNavigation } from "../../../AssignmentGroupDetail/hooks/useTopicHashNavigation";

interface GroupAssignmentContentProps {
  assignmentId: number;
  classId: number;
}

export const GroupAssignmentContent = ({
  assignmentId,
  classId,
}: GroupAssignmentContentProps) => {
  const t = useTranslations();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTopic, setEditingTopic] =
    useState<AssignmentGroupTopicResponse | null>(null);
  const [deletingTopic, setDeletingTopic] =
    useState<AssignmentGroupTopicResponse | null>(null);

  const { data: topics, isLoading } = useGetAllAssignmentGroupTopics(
    classId,
    assignmentId
  );

  const deleteMutation = useDeleteAssignmentGroupTopic();

  const handleCreateTopic = () => {
    setIsCreateOpen(true);
    window.location.hash = "#create";
  };

  const handleEditTopic = (topic: AssignmentGroupTopicResponse) => {
    setEditingTopic(topic);
    window.location.hash = `#edit-${topic.id}`;
  };

  const handleCloseTopic = () => {
    setIsCreateOpen(false);
    setEditingTopic(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const handleDelete = () => {
    if (deletingTopic) {
      deleteMutation.mutate(
        {
          topicId: deletingTopic.id,
          classId,
          assignmentId,
        },
        {
          onSuccess: () => {
            setDeletingTopic(null);
          },
        }
      );
    }
  };

  // Hash navigation
  useTopicHashNavigation({
    topics,
    onOpenCreateTopic: () => setIsCreateOpen(true),
    onOpenEditTopic: (topic) => setEditingTopic(topic),
    onCloseTopic: () => {
      setIsCreateOpen(false);
      setEditingTopic(null);
    },
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">{t("group_topics")}</CardTitle>
          <Button size="sm" onClick={handleCreateTopic}>
            <Plus className="w-4 h-4 mr-2" />
            {t("create_topic")}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !topics || topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("no_topics_yet")}</p>
              <p className="text-sm mt-2">{t("create_topic_to_start")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <TopicListItem
                  key={topic.id}
                  topic={topic}
                  onEdit={() => handleEditTopic(topic)}
                  onDelete={() => setDeletingTopic(topic)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateTopicDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseTopic();
        }}
        classId={classId}
        assignmentId={assignmentId}
      />

      {editingTopic && (
        <EditTopicDialog
          open={!!editingTopic}
          onOpenChange={(open: boolean) => {
            if (!open) handleCloseTopic();
          }}
          topic={editingTopic}
          classId={classId}
          assignmentId={assignmentId}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingTopic}
        onOpenChange={(open: boolean) => !open && setDeletingTopic(null)}
        onConfirm={handleDelete}
        title={t("delete_topic_title")}
        description={t("delete_topic_description")}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
};
