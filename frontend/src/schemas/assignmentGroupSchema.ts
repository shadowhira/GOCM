import { z } from "zod";
import { t } from "@/lib/i18n-zod";

// ============ CREATE ASSIGNMENT GROUP SCHEMA ============
export const createAssignmentGroupSchema = z.object({
  name: z
    .string()
    .min(1, t("groupNameRequired"))
    .max(100, t("groupNameMaxLength")),
});

// ============ CREATE GROUP ASSIGNMENT SCHEMA ============
export const createGroupAssignmentSchema = z.object({
  title: z
    .string()
    .min(1, t("titleRequired"))
    .max(200, t("titleMaxLength")),
  content: z
    .string()
    .max(5000, t("contentMaxLength"))
    .optional(),
  deadline: z.date({
    message: t("deadlineRequired"),
  }),
  maxScore: z
    .number()
    .min(0, t("maxScoreMin"))
    .max(100, t("maxScoreMax")),
  attachedDocumentIds: z.array(z.number()).optional(),
});

// ============ UPDATE ASSIGNMENT GROUP SCHEMA ============
export const updateAssignmentGroupSchema = z.object({
  name: z
    .string()
    .min(1, t("groupNameRequired"))
    .max(100, t("groupNameMaxLength")),
});

// ============ REJECT ASSIGNMENT GROUP SCHEMA ============
export const rejectAssignmentGroupSchema = z.object({
  reason: z
    .string()
    .min(1, t("rejectReasonRequired"))
    .max(500, t("rejectReasonMaxLength")),
});

// ============ CREATE TOPIC SCHEMA ============
export const createTopicSchema = z
  .object({
    title: z
      .string()
      .min(1, t("topicTitleRequired"))
      .max(200, t("topicTitleMaxLength")),
    description: z.string().max(1000, t("topicDescriptionMaxLength")).optional(),
    maxGroupsPerTopic: z
      .number()
      .int(t("maxGroupsMustBeInt"))
      .min(1, t("maxGroupsMin"))
      .max(100, t("maxGroupsMax")),
    maxMembers: z
      .number()
      .int(t("maxMembersMustBeInt"))
      .min(1, t("maxMembersMin"))
      .max(50, t("maxMembersMax")),
    minMembers: z
      .number()
      .int(t("minMembersMustBeInt"))
      .min(1, t("minMembersMin"))
      .max(50, t("minMembersMax")),
  })
  .refine((data) => data.minMembers <= data.maxMembers, {
    message: t("minMembersLessThanMax"),
    path: ["minMembers"],
  });

// ============ UPDATE TOPIC SCHEMA ============
export const updateTopicSchema = z
  .object({
    title: z
      .string()
      .min(1, t("topicTitleRequired"))
      .max(200, t("topicTitleMaxLength"))
      .optional(),
    description: z
      .string()
      .max(1000, t("topicDescriptionMaxLength"))
      .optional()
      .nullable(),
    maxGroupsPerTopic: z
      .number()
      .int(t("maxGroupsMustBeInt"))
      .min(1, t("maxGroupsMin"))
      .max(100, t("maxGroupsMax"))
      .optional(),
    maxMembers: z
      .number()
      .int(t("maxMembersMustBeInt"))
      .min(1, t("maxMembersMin"))
      .max(50, t("maxMembersMax"))
      .optional(),
    minMembers: z
      .number()
      .int(t("minMembersMustBeInt"))
      .min(1, t("minMembersMin"))
      .max(50, t("minMembersMax"))
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.minMembers !== undefined &&
        data.maxMembers !== undefined &&
        data.minMembers > data.maxMembers
      ) {
        return false;
      }
      return true;
    },
    {
      message: t("minMembersLessThanMax"),
      path: ["minMembers"],
    }
  );

// ============ TYPE EXPORTS ============
export type CreateAssignmentGroupFormData = z.infer<
  typeof createAssignmentGroupSchema
>;
export type UpdateAssignmentGroupFormData = z.infer<
  typeof updateAssignmentGroupSchema
>;
export type RejectAssignmentGroupFormData = z.infer<
  typeof rejectAssignmentGroupSchema
>;
export type CreateTopicFormData = z.infer<typeof createTopicSchema>;
export type UpdateTopicFormData = z.infer<typeof updateTopicSchema>;

export type CreateGroupAssignmentFormData = z.infer<
  typeof createGroupAssignmentSchema
>;