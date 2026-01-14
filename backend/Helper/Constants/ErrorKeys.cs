namespace OnlineClassroomManagement.Helper.Constants
{
    /// <summary>
    /// Error keys for i18n support in frontend
    /// </summary>
    public static class ErrorKeys
    {
        // Common
        public const string UserNotLoggedIn = "error_user_not_logged_in";
        public const string NotClassMember = "error_not_class_member";
        public const string ClassNotFound = "error_class_not_found";
        public const string NotStudent = "error_not_student";
        public const string OnlyTeacher = "error_only_teacher";
        
        // Assignment
        public const string AssignmentNotFound = "error_assignment_not_found";
        public const string AssignmentInClassNotFound = "error_assignment_in_class_not_found";
        public const string AssignmentNotGroupType = "error_assignment_not_group_type";
        public const string AssignmentExpired = "error_assignment_expired";
        public const string CreatorNotInClass = "error_creator_not_in_class";
        public const string CreatorNotTeacher = "error_creator_not_teacher";
        public const string DocumentsNotFound = "error_documents_not_found";
        public const string ExcelFileEmpty = "error_excel_file_empty";
        public const string ExcelFormatInvalid = "error_excel_format_invalid";
        public const string ExcelNoValidSheet = "error_excel_no_valid_sheet";
        public const string ExcelNoValidQuestions = "error_excel_no_valid_questions";
        public const string ExcelCorrectAnswerEmpty = "error_excel_correct_answer_empty";
        public const string ExcelPointInvalid = "error_excel_point_invalid";
        public const string ExcelMinOptions = "error_excel_min_options";
        public const string ExcelMinCorrectOption = "error_excel_min_correct_option";
        public const string OnlyTeacherCanCreateFromExcel = "error_only_teacher_can_create_from_excel";
        public const string UserNotInClass = "error_user_not_in_class";
        
        // Assignment Group
        public const string AssignmentGroupNotFound = "error_assignment_group_not_found";
        public const string AlreadyJoinedGroup = "error_already_joined_group";
        public const string OnlyStudentCanCreateGroup = "error_only_student_can_create_group";
        public const string NotGroupMember = "error_not_group_member";
        public const string CannotLeaveApprovedGroup = "error_cannot_leave_approved_group";
        public const string LeaderCannotLeave = "error_leader_cannot_leave";
        public const string AlreadyGroupMember = "error_already_group_member";
        public const string CannotJoinApprovedGroup = "error_cannot_join_approved_group";
        public const string OnlyLeaderCanInvite = "error_only_leader_can_invite";
        public const string CannotInviteToApprovedGroup = "error_cannot_invite_to_approved_group";
        public const string MemberNotFound = "error_member_not_found";
        public const string MemberAlreadyInGroup = "error_member_already_in_group";
        public const string MemberInOtherGroup = "error_member_in_other_group";
        public const string AlreadySentInvitation = "error_already_sent_invitation";
        public const string OnlyLeaderCanUpdate = "error_only_leader_can_update";
        public const string OnlyLeaderCanRemoveMember = "error_only_leader_can_remove_member";
        public const string GroupMemberNotFound = "error_group_member_not_found";
        public const string OnlyDraftCanRequestApproval = "error_only_draft_can_request_approval";
        public const string OnlyLeaderCanRequestApproval = "error_only_leader_can_request_approval";
        public const string TopicMaxGroupsReached = "error_topic_max_groups_reached";
        public const string GroupMemberCountInvalid = "error_group_member_count_invalid";
        public const string CannotRequestExpiredAssignment = "error_cannot_request_expired_assignment";
        public const string ApprovalRequestNotFound = "error_approval_request_not_found";
        public const string GroupInfoNotFound = "error_group_info_not_found";
        public const string AssignmentInfoNotFound = "error_assignment_info_not_found";
        public const string OnlyTeacherCanApprove = "error_only_teacher_can_approve";
        public const string GroupNotPendingApproval = "error_group_not_pending_approval";
        public const string TopicNotFound = "error_topic_not_found";
        public const string OnlyTeacherCanReject = "error_only_teacher_can_reject";
        public const string PendingApprovalNotFound = "error_pending_approval_not_found";
        public const string TopicRelatedNotFound = "error_topic_related_not_found";
        public const string OnlyTeacherCanViewApprovalRequests = "error_only_teacher_can_view_approval_requests";
        public const string NotGroupLeader = "error_not_group_leader";
        public const string AlreadyLeader = "error_already_leader";
        public const string NewLeaderNotFound = "error_new_leader_not_found";
        
        // Assignment Group Invitation
        public const string InvitationNotFound = "error_invitation_not_found";
        public const string InvitationNotYours = "error_invitation_not_yours";
        public const string InvitationAlreadyProcessed = "error_invitation_already_processed";
        public const string NotInvitationSender = "error_not_invitation_sender";
        
        // Assignment Group Topic
        public const string OnlyTeacherCanCreateTopic = "error_only_teacher_can_create_topic";
        public const string OnlyTeacherCanUpdateTopic = "error_only_teacher_can_update_topic";
        public const string OnlyTeacherCanDeleteTopic = "error_only_teacher_can_delete_topic";
        public const string CannotDeleteTopicWithGroups = "error_cannot_delete_topic_with_groups";
        
        // Grade
        public const string SubmissionNotFound = "error_submission_not_found";
        public const string GradeScoreInvalid = "error_grade_score_invalid";
        public const string GraderMemberNotFound = "error_grader_member_not_found";
        public const string UserInfoNotFound = "error_user_info_not_found";
        public const string NotStudentInClass = "error_not_student_in_class";
        
        // Quiz
        public const string QuestionTextRequired = "error_question_text_required";
        public const string MinOneOption = "error_min_one_option";
        public const string MinOneCorrectOption = "error_min_one_correct_option";
        public const string SingleChoiceOneCorrect = "error_single_choice_one_correct";
        public const string QuestionNotFound = "error_question_not_found";
        public const string OptionTextRequired = "error_option_text_required";
        public const string OptionNotFound = "error_option_not_found";
        public const string InvalidId = "error_invalid_id";
        
        // Submission
        public const string AlreadySubmitted = "error_already_submitted";
        public const string SomeDocumentsNotFound = "error_some_documents_not_found";
        public const string GroupNotFoundInAssignment = "error_group_not_found_in_assignment";
        public const string GroupNotApproved = "error_group_not_approved";
        public const string NotGroupMemberInSubmission = "error_not_group_member_in_submission";
        public const string OnlyLeaderCanSubmit = "error_only_leader_can_submit";
        public const string QuizNoAnswers = "error_quiz_no_answers";
        public const string AnswerCountMismatch = "error_answer_count_mismatch";
        public const string OnlyQuizCanHaveAnswers = "error_only_quiz_can_have_answers";
        public const string QuestionNotInQuiz = "error_question_not_in_quiz";
        public const string DeadlinePassed = "error_deadline_passed";
        public const string NoPermissionToEditSubmission = "error_no_permission_to_edit_submission";
        public const string SubmissionGradedCannotEdit = "error_submission_graded_cannot_edit";
        public const string NoPermissionToCancelSubmission = "error_no_permission_to_cancel_submission";
        public const string SubmissionGradedCannotCancel = "error_submission_graded_cannot_cancel";
        public const string GroupSubmissionNotFound = "error_group_submission_not_found";
        public const string ClassOfAssignmentNotFound = "error_class_of_assignment_not_found";
        public const string OnlyCreatorCanUpdate = "error_only_creator_can_update";
        public const string AssignmentTitleRequired = "error_assignment_title_required";
        public const string MaxScoreMustBePositive = "error_max_score_must_be_positive";
        public const string ClassRelatedNotFound = "error_class_related_not_found";
        public const string AssignmentNotInClass = "error_assignment_not_in_class";
        public const string QuizMustHaveAtLeastOneQuestion = "error_quiz_must_have_at_least_one_question";
        public const string OnlyCreatorCanDelete = "error_only_creator_can_delete";
        public const string DeleteFileFromStorageFailed = "error_delete_file_from_storage_failed";
        public const string TeacherNotAllowShowResult = "error_teacher_not_allow_show_result";
        public const string AssignmentNotYetFinished = "error_assignment_not_yet_finished";

        // Document
        public const string DocumentNotFound = "error_document_not_found";
    }
}
