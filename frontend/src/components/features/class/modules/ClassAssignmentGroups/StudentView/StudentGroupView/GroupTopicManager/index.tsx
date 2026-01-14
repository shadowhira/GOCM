"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentGroupStatus } from "@/types/assignmentGroup";
import type {
  AssignmentGroupResponse,
  AssignmentGroupMemberResponse,
} from "@/types/assignmentGroup";

import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { GroupTopicHeader } from "./GroupTopicHeader";
import { TopicSeletionSection } from "./TopicSeletionSection";
import { GroupInfoSection } from "./GroupInfoSection";
import { TransferLeadershipDialog } from "./TransferLeadershipDialog";
import { RemoveMemberDialog } from "./RemoveMemberDialog";
import { useRemoveMemberFromAssignmentGroup, useTransferLeadership } from "@/queries/assignmentGroupQueries";

interface GroupTopicManagerProps {
  group: AssignmentGroupResponse | undefined;
  topics: AssignmentGroupTopicResponse[] | undefined;
  selectedTopicId: number | null;
  onTopicChange: (id: number) => void;
  classId: number;
  assignmentId: number;
}

export const GroupTopicManager = ({
  group,
  topics,
  selectedTopicId,
  onTopicChange,
  classId,
  assignmentId,
}: GroupTopicManagerProps) => {
  const [transferLeaderDialogOpen, setTransferLeaderDialogOpen] =
    useState(false);
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] =
    useState<AssignmentGroupMemberResponse | null>(null);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [selectedMemberForRemove, setSelectedMemberForRemove] =
    useState<AssignmentGroupMemberResponse | null>(null);

  const selectedTopic = topics?.find((t) => t.id === selectedTopicId);
  const removeMemberMutation = useRemoveMemberFromAssignmentGroup();
  const transferLeadershipMutation = useTransferLeadership();

  const handleOpenRemoveDialog = (member: AssignmentGroupMemberResponse) => {
    setSelectedMemberForRemove(member);
    setRemoveMemberDialogOpen(true);
  };

  const confirmRemoveMember = () => {
    if (group && selectedMemberForRemove) {
      removeMemberMutation.mutate({
        assignmentGroupId: group.id,
        memberId: selectedMemberForRemove.id,
      });
    }
    setRemoveMemberDialogOpen(false);
    setSelectedMemberForRemove(null);
  };

  const handleTransferLeadership = (member: AssignmentGroupMemberResponse) => {
    setSelectedMemberForTransfer(member);
    setTransferLeaderDialogOpen(true);
  };

  const confirmTransferLeadership = () => {
    if (group && selectedMemberForTransfer) {
      transferLeadershipMutation.mutate({
        assignmentGroupId: group.id,
        memberId: selectedMemberForTransfer.id,
      });
    }
    setTransferLeaderDialogOpen(false);
    setSelectedMemberForTransfer(null);
  };

  const isGroupApproved = group?.status === AssignmentGroupStatus.Approved;

  return (
    <Card>
      <GroupTopicHeader
        group={group}
        selectedTopic={selectedTopic}
        isGroupApproved={isGroupApproved}
      />
      <CardContent className="space-y-6">
        {/* Topic Selection Section */}
        <TopicSeletionSection
          topics={topics}
          selectedTopicId={selectedTopicId}
          onTopicChange={onTopicChange}
          group={group}
        />

        {/* Group Info Section */}
        <GroupInfoSection
          group={group}
          classId={classId}
          assignmentId={assignmentId}
          selectedTopic={selectedTopic}
          handleTransferLeadership={handleTransferLeadership}
          handleOpenRemoveDialog={handleOpenRemoveDialog}
        />

        {/* Transfer Leadership Dialog */}
        <TransferLeadershipDialog
          confirmTransferLeadership={confirmTransferLeadership}
          transferLeaderDialogOpen={transferLeaderDialogOpen}
          setTransferLeaderDialogOpen={setTransferLeaderDialogOpen}
          selectedMemberForTransfer={selectedMemberForTransfer}
        />

        {/* Remove Member Dialog */}
        <RemoveMemberDialog
          open={removeMemberDialogOpen}
          setOpen={setRemoveMemberDialogOpen}
          selectedMember={selectedMemberForRemove}
          confirmRemove={confirmRemoveMember}
        />
      </CardContent>
    </Card>
  );
};
