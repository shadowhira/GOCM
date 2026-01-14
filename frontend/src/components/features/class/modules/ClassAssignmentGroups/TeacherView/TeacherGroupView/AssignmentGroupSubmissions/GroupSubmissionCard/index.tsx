import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import type { SubmissionResponse } from "@/types/submission";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { GroupSubmissionCardHeader } from "./GroupSubmissionCardHeader";
import { GroupSubmissionCardMembers } from "./GroupSubmissionCardMembers";
import {
  UserDetailModal,
  useUserDetailModal,
  type UserBasicInfo,
} from "@/components/features/user";

interface GroupSubmissionCardProps {
  submission: SubmissionResponse;
  maxGrade: number;
  classId: number;
  assignmentId: number;
  t: (key: string) => string;
}

export function GroupSubmissionCard({
  submission,
  maxGrade,
  classId,
  assignmentId,
  t,
}: GroupSubmissionCardProps): React.ReactElement {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOpen: isUserModalOpen, selectedUser, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal();

  const assignmentGroup = submission.assignmentGroup;
  const groupMembers = assignmentGroup?.groupMembers || [];
  const leader = groupMembers.find((m) => m.isLeader);
  const isGroupSubmission = !!assignmentGroup;

  // Build href for submission detail
  const submissionHref = submission.status !== 0 
    ? `/${locale}/class/${classId}/assignment-groups/${assignmentId}/submissions/${submission.id}`
    : null;

  const handleAvatarClick = (userInfo: UserBasicInfo) => {
    openUserModal(userInfo, null);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  // Card inner content
  const cardInnerContent = (
    <>
      <div
        className={`p-3 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
          submission.status !== 0 ? "cursor-pointer hover:bg-muted/10" : ""
        }`}
      >
        <GroupSubmissionCardHeader
          submission={submission}
          assignmentGroup={assignmentGroup || undefined}
          groupMembers={groupMembers}
          leader={leader}
          isGroupSubmission={isGroupSubmission}
          isExpanded={isExpanded}
          classId={classId}
          t={t}
          toggleExpanded={toggleExpanded}
          onAvatarClick={handleAvatarClick}
        />
        <div className="shrink-0">
          <SubmissionStatusBadge
            status={submission.status}
            grade={submission.grade}
            maxGrade={maxGrade}
            t={t}
          />
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1 w-20 justify-end">
            <span
              className={`font-semibold ${
                submission.grade ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {submission.grade?.score ?? "--"}
            </span>
            <span className="text-muted-foreground text-sm">
              / {maxGrade}
            </span>
          </div>
        </div>

        {/* Feedback Display */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-sm text-muted-foreground truncate max-w-72">
            {submission.grade?.feedback || t("no_feedback")}
          </p>
        </div>
      </div>
      {isGroupSubmission && isExpanded && groupMembers.length > 0 && (
        <GroupSubmissionCardMembers groupMembers={groupMembers} classId={classId} t={t} onAvatarClick={handleAvatarClick} />
      )}
    </>
  );

  return (
    <>
      {submissionHref ? (
        <Link href={submissionHref} prefetch={true} className="block">
          <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
            {cardInnerContent}
          </Card>
        </Link>
      ) : (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
          {cardInnerContent}
        </Card>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={null}
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
        />
      )}
    </>
  );
}
