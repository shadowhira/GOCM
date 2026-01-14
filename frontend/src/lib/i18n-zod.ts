/**
 * Helper function to get translation for Zod schema validation messages
 * This is a workaround since Zod schemas are defined at module level
 * and we can't use useTranslations hook there.
 *
 * The actual translation will be handled by the error messages being
 * displayed in the UI components.
 */

// Translation key mapping for validation messages
export const validationMessages = {
  // File validation
  fileNameRequired: "validation_file_name_required",
  invalidUrl: "validation_invalid_url",

  // Option validation
  optionTextRequired: "validation_option_text_required",

  // Question validation
  questionRequired: "validation_question_required",
  pointMin: "validation_point_min",
  minTwoOptions: "validation_min_2_options",
  singleChoiceOneCorrect: "validation_single_choice_one_correct",
  multipleChoiceMinCorrect: "validation_multiple_choice_min_correct",

  // Assignment validation
  titleRequired: "validation_title_required",
  titleMaxLength: "validation_title_max_length",
  deadlineRequired: "validation_deadline_required",
  deadlineFuture: "validation_deadline_future",
  maxScoreMin: "validation_max_score_min",
  maxScoreMax: "validation_max_score_max",
  quizMustHaveQuestions: "validation_quiz_must_have_questions",
  contentMaxLength: "validation_content_max_length",

  // Pagination validation
  pageNumberMin: "validation_page_number_min",
  pageSizeMin: "validation_page_size_min",
  pageSizeMax: "validation_page_size_max",

  // Search validation
  searchQueryRequired: "validation_search_query_required",

  // File upload validation
  fileSizeMax: "validation_file_size_max",
  fileTypeNotSupported: "validation_file_type_not_supported",
  excelFileRequired: "validation_excel_file_required",

  // AI Quiz validation
  numQuestionsMin: "validation_num_questions_min",
  numQuestionsMax: "validation_num_questions_max",
  languageRequired: "validation_language_required",
  questionTypesRequired: "validation_question_types_required",
  promptRequired: "validation_prompt_required",
  minZero: "validation_min_zero",
  maxThirty: "validation_max_thirty",
  atLeastOneQuestion: "validation_at_least_one_question",
  maxThirtyTotal: "validation_max_thirty_total",
  minOnePoint: "validation_min_one_point",
  questionTypeDistributionMustMatch: "validation_question_type_distribution_must_match",

  // Submission validation
  selectOneOption: "validation_select_one_option",
  timeSpentMin: "validation_time_spent_min",
  answeredAtDatetime: "validation_answered_at_datetime",
  provideContentOrFile: "validation_provide_content_or_file",
  quizMustIncludeAnswers: "validation_quiz_must_include_answers",

  // Grade validation
  scoreMin: "validation_score_min",
  scoreMax: "validation_score_max",
  feedbackMaxLength: "validation_feedback_max_length",

  // Assignment Group validation
  groupNameRequired: "validation_group_name_required",
  groupNameMaxLength: "validation_group_name_max_length",
  rejectReasonRequired: "validation_reject_reason_required",
  rejectReasonMaxLength: "validation_reject_reason_max_length",

  // Topic validation
  topicTitleRequired: "validation_topic_title_required",
  topicTitleMaxLength: "validation_topic_title_max_length",
  topicDescriptionMaxLength: "validation_topic_description_max_length",
  maxGroupsMustBeInt: "validation_max_groups_must_be_int",
  maxGroupsMin: "validation_max_groups_min",
  maxGroupsMax: "validation_max_groups_max",
  maxMembersMustBeInt: "validation_max_members_must_be_int",
  maxMembersMin: "validation_max_members_min",
  maxMembersMax: "validation_max_members_max",
  minMembersMustBeInt: "validation_min_members_must_be_int",
  minMembersMin: "validation_min_members_min",
  minMembersMax: "validation_min_members_max",
  minMembersLessThanMax: "validation_min_members_less_than_max",
} as const;

/**
 * Helper function to get translation key from validationMessages
 * This function returns the translation key string that can be used
 * in Zod schema validation messages.
 */
export function t(key: keyof typeof validationMessages): string {
  return validationMessages[key];
}