import { Button } from "@/components/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useLeaveAssignmentGroup,
  useRequestAssignmentGroupApproval,
} from "@/queries/assignmentGroupQueries";
import {
  AssignmentGroupResponse,
  AssignmentGroupStatus,
} from "@/types/assignmentGroup";
import { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";
import { LogOut, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface ApprovalRequestActionProps {
  group: AssignmentGroupResponse | undefined;
  selectedTopic?: AssignmentGroupTopicResponse | undefined;
  isCurrentUserLeader?: boolean;
}

export const ApprovalRequestAction = ({
  group,
  selectedTopic,
  isCurrentUserLeader,
}: ApprovalRequestActionProps) => {
  const t = useTranslations();
  const leaveMutation = useLeaveAssignmentGroup();
  const requestApprovalMutation = useRequestAssignmentGroupApproval();

  const handleLeave = () => {
    if (group) {
      leaveMutation.mutate(group.id);
    }
  };

  const handleRequestApproval = () => {
    if (group && selectedTopic) {
      requestApprovalMutation.mutate({
        assignmentGroupId: group.id,
        topicId: selectedTopic.id,
      });
    } else {
      toast.error(t("no_topic_selected"));
    }
  };

  const canRequestApproval =
    group &&
    group.status !== AssignmentGroupStatus.PendingApproval &&
    group.status !== AssignmentGroupStatus.Approved &&
    isCurrentUserLeader &&
    selectedTopic &&
    (group.groupMembers?.length || 0) >= (selectedTopic?.minMembers || 1);

  const canLeaveGroup =
    group && group.status !== AssignmentGroupStatus.PendingApproval &&
    group.status !== AssignmentGroupStatus.Approved;

  return (
    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
      {canRequestApproval && (
        <Button
          onClick={handleRequestApproval}
          disabled={requestApprovalMutation.isPending}
          className="w-full sm:w-auto"
        >
          <Send className="w-4 h-4 mr-2" />
          {t("request_approval")}
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {canLeaveGroup && (
            <Button
            variant="destructive"
            disabled={leaveMutation.isPending}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("leave_group")}
          </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("leave_group_confirm_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("leave_group_confirm_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("confirm_leave")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
