﻿using OnlineClassroomManagement.Helper.Constants;
using OnlineClassroomManagement.Models.Requests.Quizs;

namespace OnlineClassroomManagement.Models.Requests.Assignments
{
    public class CreateAssignmentRequest
    {
        public required string Title { get; set; }
        public string? Content { get; set; }
        public List<int>? AttachedDocumentIds { get; set; }
        public DateTime Deadline { get; set; }
        public double MaxScore { get; set; }
        public AssignmentType Type { get; set; }
        public List<CreateQuizQuestionRequest>? ListQuestions { get; set; }

    }
}