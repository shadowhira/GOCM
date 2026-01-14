"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRejectAssignmentGroupRequest } from "@/queries/assignmentGroupQueries";
import {
  rejectAssignmentGroupSchema,
  type RejectAssignmentGroupFormData,
} from "@/schemas/assignmentGroupSchema";

interface RejectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalRequestId: number;
  groupName: string;
}

export const RejectRequestDialog = ({
  open,
  onOpenChange,
  approvalRequestId,
  groupName,
}: RejectRequestDialogProps) => {
  const t = useTranslations();

  const form = useForm<RejectAssignmentGroupFormData>({
    resolver: zodResolver(rejectAssignmentGroupSchema),
    defaultValues: {
      reason: "",
    },
  });

  const rejectMutation = useRejectAssignmentGroupRequest();

  const onSubmit = (data: RejectAssignmentGroupFormData) => {
    rejectMutation.mutate(
      {
        approvalRequestId,
        data,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reject_group_request_title")}</DialogTitle>
          <DialogDescription>
            {t("reject_group_request_description", {
              groupName,
            })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }: { field: ControllerRenderProps<RejectAssignmentGroupFormData, "reason"> }) => (
                <FormItem>
                  <FormLabel>{t("rejection_reason")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("rejection_reason_placeholder")}
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={rejectMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("reject")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
