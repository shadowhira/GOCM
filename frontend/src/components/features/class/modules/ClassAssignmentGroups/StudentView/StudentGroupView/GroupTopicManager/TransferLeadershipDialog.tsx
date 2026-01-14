import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AssignmentGroupMemberResponse } from "@/types/assignmentGroup";
import { useTranslations } from "next-intl";

interface TransferLeadershipDialogProps {
  confirmTransferLeadership: () => void;
  transferLeaderDialogOpen: boolean;
  setTransferLeaderDialogOpen: (open: boolean) => void;
  selectedMemberForTransfer: AssignmentGroupMemberResponse | null;
}

export const TransferLeadershipDialog = ({
  confirmTransferLeadership,
  transferLeaderDialogOpen,
  setTransferLeaderDialogOpen,
  selectedMemberForTransfer,
}: TransferLeadershipDialogProps) => {
  const t = useTranslations();

  return (
    <AlertDialog
      open={transferLeaderDialogOpen}
      onOpenChange={setTransferLeaderDialogOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("transfer_leadership_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("transfer_leadership_description", {
              memberName:
                selectedMemberForTransfer?.member.userName ||
                selectedMemberForTransfer?.member.userEmail ||
                "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmTransferLeadership}>
            {t("confirm_transfer")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
