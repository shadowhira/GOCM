"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAcceptAssignmentGroupRequest } from "@/queries/assignmentGroupQueries";

interface AcceptRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalRequestId: number;
  groupName: string;
}

export const AcceptRequestDialog = ({
  open,
  onOpenChange,
  approvalRequestId,
  groupName,
}: AcceptRequestDialogProps) => {
  const t = useTranslations();

  const acceptMutation = useAcceptAssignmentGroupRequest();

  const handleAccept = () => {
    acceptMutation.mutate(approvalRequestId, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("accept_group_request_title")}</DialogTitle>
          <DialogDescription>
            {t("accept_group_request_description", {
              groupName,
            })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={acceptMutation.isPending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleAccept} disabled={acceptMutation.isPending}>
            {acceptMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {t("accept")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
