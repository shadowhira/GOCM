import Link from "next/link";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { usePathname } from "next/navigation";
import type { SubmissionResponse } from "@/types/submission";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { CosmeticAvatar } from "@/components/features/cosmetics";
import { parseBackendDateTime } from "@/lib/utils";
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
} from "@/components/features/user";
import { Fragment } from "react";

interface SubmissionCardProps {
  submission: SubmissionResponse;
  maxGrade: number;
  classId: number;
  assignmentId: number;
  t: (key: string) => string;
}

export function SubmissionCard({
  submission,
  maxGrade,
  classId,
  assignmentId,
  t,
}: SubmissionCardProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const { isOpen: isUserModalOpen, selectedUser, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal();

  // Build href for submission detail
  const submissionHref = submission.status !== 0 
    ? `/${locale}/class/${classId}/assignments/${assignmentId}/submissions/${submission.id}`
    : null;

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const userBasicInfo: UserBasicInfo = {
      id: submission.submitById!,
      displayName: submission.submitByName || t("unknown"),
      email: submission.submitByEmail || "",
      avatarUrl: submission.submitByAvatarUrl,
    };
    openUserModal(userBasicInfo, null);
  };

  // Card inner content
  const cardInnerContent = (
    <div
      className={`p-3 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors ${
        submission.status !== 0 ? "cursor-pointer hover:bg-muted/10" : ""
      }`}
    >
      {/* Column 1: Student Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <ClickableAvatarWrapper onClick={handleAvatarClick}>
          <CosmeticAvatar
            classId={classId}
            classMemberId={submission.submitById}
            avatarUrl={submission.submitByAvatarUrl}
            displayName={submission.submitByName || t("unknown")}
            size="sm"
          />
        </ClickableAvatarWrapper>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">
            {submission.submitByName ||
              (submission.submitById
                ? `${t("student")} #${submission.submitById}`
                : t("unknown"))}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {submission.submitByEmail}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {submission.submittedTime
              ? format(
                  parseBackendDateTime(String(submission.submittedTime)) || new Date(submission.submittedTime),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi }
                )
              : t("not_submitted")}
          </p>
        </div>
      </div>

      {/* Column 2: Status Badge */}
      <div className="shrink-0">
        <SubmissionStatusBadge
          status={submission.status}
          grade={submission.grade}
          maxGrade={maxGrade}
          t={t}
        />
      </div>

      {/* Column 3: Score */}
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

      {/* Column 4: Feedback */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <p className="text-sm text-muted-foreground truncate max-w-72">
          {submission.grade?.feedback || t("no_feedback")}
        </p>
      </div>
    </div>
  );

  return (
    <Fragment>
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
    </Fragment>
  );
}
