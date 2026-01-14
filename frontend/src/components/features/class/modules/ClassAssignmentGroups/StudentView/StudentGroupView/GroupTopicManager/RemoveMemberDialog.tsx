// RemoveMemberDialog.tsx
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

interface RemoveMemberDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedMember: AssignmentGroupMemberResponse | null;
  confirmRemove: () => void;
}

export const RemoveMemberDialog = ({
  open,
  setOpen,
  selectedMember,
  confirmRemove,
}: RemoveMemberDialogProps) => {
  const t = useTranslations();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("remove_member_title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("remove_member_description", {
              memberName:
                selectedMember?.member.userName ||
                selectedMember?.member.userEmail ||
                "",
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white" onClick={confirmRemove}>
            {t("confirm_remove")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
