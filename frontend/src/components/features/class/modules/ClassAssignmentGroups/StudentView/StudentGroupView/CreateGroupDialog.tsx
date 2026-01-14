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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateAssignmentGroup } from "@/queries/assignmentGroupQueries";
import {
  createAssignmentGroupSchema,
  type CreateAssignmentGroupFormData,
} from "@/schemas/assignmentGroupSchema";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  assignmentId: number;
}

export const CreateGroupDialog = ({
  open,
  onOpenChange,
  classId,
  assignmentId
}: CreateGroupDialogProps) => {
  const t = useTranslations();

  const form = useForm<CreateAssignmentGroupFormData>({
    resolver: zodResolver(createAssignmentGroupSchema),
    defaultValues: {
      name: "",
    },
  });

  const createMutation = useCreateAssignmentGroup();

  const onSubmit = (data: CreateAssignmentGroupFormData) => {
    createMutation.mutate(
      {
        classId,
        assignmentId,
        data: {
          ...data,
        },
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
      <DialogContent 
        className="rounded-lg"
        style={{ 
          width: 'calc(100vw - 2rem)',
          maxWidth: '28rem'
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("create_group")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: { field: ControllerRenderProps<CreateAssignmentGroupFormData, "name"> }) => (
                <FormItem>
                  <FormLabel>{t("group_name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("group_name_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Tối ưu hóa DialogFooter cho Mobile */}
            <DialogFooter
                className="
                    flex-col-reverse sm:flex-row 
                    sm:justify-end 
                    gap-2 sm:gap-0
                "
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                // Thêm full width trên mobile
                className="w-full sm:w-auto"
              >
                {t("cancel")}
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                // Thêm full width trên mobile
                className="w-full sm:w-auto"
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
