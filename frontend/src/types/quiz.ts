import { QuestionType } from "./constants";

// AI Generation Request/Response Types
export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface QuestionTypeDistribution {
  single: number;
  multiple: number;
}

export type PointStrategy = "equal" | "difficulty_weighted";

export interface GenerateFromPromptRequest {
  prompt: string;
  difficulty_distribution: DifficultyDistribution;
  question_type_distribution: QuestionTypeDistribution;
  language: string;
  total_points: number;
  point_strategy: PointStrategy;
}

export interface GeneratedQuizOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
}

export interface GeneratedQuizQuestion {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  point: number;
  options: GeneratedQuizOption[];
}

export interface GenerateFromPromptResponse {
  success: boolean;
  message: string;
  questions: GeneratedQuizQuestion[];
  total_questions: number;
  metadata: {
    difficulty_distribution: DifficultyDistribution;
    question_type_distribution: QuestionTypeDistribution;
    language: string;
    source: string;
    prompt: string | null;
    total_points: number;
    point_strategy: PointStrategy;
    file_name: string | null;
  };
}

export interface GenerateFromFileParams {
  difficulty_distribution?: DifficultyDistribution;
  question_type_distribution?: QuestionTypeDistribution;
  language?: string;
  total_points?: number;
  point_strategy?: PointStrategy;
  prompt?: string;
}

// Query relevance information for AI document quiz
export type QueryRelevanceStrategy = "search" | "hybrid" | "representative";

export interface QueryRelevanceInfo {
  is_relevant: boolean;
  relevance_score: number;
  confidence: number;
  strategy_used: QueryRelevanceStrategy;
  warning_message: string | null;
  details: Record<string, unknown> | null;
}

export interface GenerateFromFileResponse {
  success: boolean;
  message: string;
  questions: GeneratedQuizQuestion[];
  total_questions: number;
  metadata: {
    difficulty_distribution: DifficultyDistribution;
    question_type_distribution: QuestionTypeDistribution;
    language: string;
    source: string;
    file_name: string | null;
    prompt: string | null;
    total_points: number;
    point_strategy: PointStrategy;
  };
  parsed_text?: string;
  chunks?: string[];
  query_relevance?: QueryRelevanceInfo | null;
}

// Form Data Types
export interface QuizByAIFormData {
  title: string;
  content: string;
  deadline: Date;
  maxScore: number;
  listQuestions: QuizQuestion[];
  // AI specific fields
  aiMode: "prompt" | "file";
  prompt: string;
  difficulty_distribution: DifficultyDistribution;
  question_type_distribution: QuestionTypeDistribution;
  language: string;
  total_points: number;
  point_strategy: PointStrategy;
  file?: File;
}

export interface QuizQuestion {
  id?: number;
  questionText: string;
  questionType: QuestionType;
  point: number;
  options: QuizOption[];
}

export interface QuizOption {
  id?: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuizAnswer {
  id: number;
  quizQuestionId: number;
  selectedOptionIds: number[];
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: string;
}

export interface QuizQuestionResponse {
  id: number;
  questionText: string;
  questionType: QuestionType;
  point: number;
  options: QuizOptionResponse[];
  correctAnswers?: string[]; // Only for teachers/admins
}

export interface QuizOptionResponse {
  id: number;
  optionText: string;
  isCorrect?: boolean; // Only for teachers/admins
}

export interface QuizAnswerResponse {
  id: number;
  quizQuestionId: number;
  selectedOptionIds: number[];
  timeSpent: number;
  answeredAt: string;
}

export interface CreateQuizQuestionRequest {
  questionText: string;
  questionType: QuestionType;
  point: number;
  options: CreateQuizOptionRequest[];
}

export interface CreateQuizOptionRequest {
  optionText: string;
  isCorrect: boolean;
}

export interface CreateQuizAnswerRequest {
  quizQuestionId: number;
  selectedOptionIds: number[];
  isCorrect: boolean;
  timeSpent: number;
  answeredAt: Date;
}

export interface UpdateQuizQuestionRequest extends CreateQuizQuestionRequest {
  id: number;
  options: UpdateQuizOptionRequest[];
}

export interface UpdateQuizOptionRequest extends CreateQuizOptionRequest {
  id: number;
}
