"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUpdateAssignmentGroupTopic } from "@/queries/assignmentGroupTopicQueries";
import {
  updateTopicSchema,
  type UpdateTopicFormData,
} from "@/schemas/assignmentGroupSchema";
import type { AssignmentGroupTopicResponse } from "@/types/assignmentGroupTopic";

interface EditTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: AssignmentGroupTopicResponse;
  classId: number;
  assignmentId: number;
}

export const EditTopicDialog = ({
  open,
  onOpenChange,
  topic,
}: EditTopicDialogProps) => {
  const t = useTranslations();

  const form = useForm<UpdateTopicFormData>({
    resolver: zodResolver(updateTopicSchema),
    values: {
      title: topic.title,
      description: topic.description || "",
      maxGroupsPerTopic: topic.maxGroupsPerTopic,
      maxMembers: topic.maxMembers,
      minMembers: topic.minMembers,
    },
  });

  const updateMutation = useUpdateAssignmentGroupTopic();

  const onSubmit = (data: UpdateTopicFormData) => {
    updateMutation.mutate(
      {
        topicId: topic.id,
        data,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("edit_topic")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("topic_title")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("topic_title_placeholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("topic_description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("topic_description_placeholder")}
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("min_members")}
                </label>
                <Input
                  type="number"
                  {...form.register("minMembers", { valueAsNumber: true })}
                  min={1}
                  placeholder="2"
                  className={cn(
                    form.formState.errors.minMembers && "border-destructive"
                  )}
                />
                {form.formState.errors.minMembers && (
                  <p className="text-sm text-destructive">
                    {t(String(form.formState.errors.minMembers.message))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("max_members")}
                </label>
                <Input
                  type="number"
                  {...form.register("maxMembers", { valueAsNumber: true })}
                  min={1}
                  placeholder="4"
                  className={cn(
                    form.formState.errors.maxMembers && "border-destructive"
                  )}
                />
                {form.formState.errors.maxMembers && (
                  <p className="text-sm text-destructive">
                    {t(String(form.formState.errors.maxMembers.message))}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("max_groups")}
                </label>
                <Input
                  type="number"
                  {...form.register("maxGroupsPerTopic", { valueAsNumber: true })}
                  min={1}
                  placeholder="2"
                  className={cn(
                    form.formState.errors.maxGroupsPerTopic && "border-destructive"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  {t("max_groups_per_topic_desc")}
                </p>
                {form.formState.errors.maxGroupsPerTopic && (
                  <p className="text-sm text-destructive">
                    {t(String(form.formState.errors.maxGroupsPerTopic.message))}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
