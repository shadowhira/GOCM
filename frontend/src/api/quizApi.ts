import axios from "axios";
import type {
  GenerateFromPromptRequest,
  GenerateFromPromptResponse,
  GenerateFromFileResponse,
  GenerateFromFileParams,
  QuizQuestion,
} from "@/types/quiz";
import httpClient from "@/lib/axios";

// Quiz API sử dụng FastAPI backend trên port 8000
const QUIZ_API_BASE =
  process.env.NEXT_PUBLIC_QUIZ_API_BASE ?? "http://localhost:8000";

console.log("Using QUIZ_API_BASE:", QUIZ_API_BASE);

// const QUIZ_API_BASE = "http://localhost:8000";
const quizHttpClient = axios.create({
  baseURL: `${QUIZ_API_BASE}/api`,
  timeout: 5 * 60 * 1000, // 5 minutes timeout cho AI generation
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor để trả về data trực tiếp
quizHttpClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export const quizApi = {
  // POST /api/quiz/generate-from-prompt
  generateFromPrompt: (
    data: GenerateFromPromptRequest
  ): Promise<GenerateFromPromptResponse> =>
    quizHttpClient.post("/quiz/generate-from-prompt", data),

  // POST /api/quiz/generate-from-file (multipart/form-data)
  generateFromFile: (
    file: File,
    params: GenerateFromFileParams
  ): Promise<GenerateFromFileResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    if (params.difficulty_distribution) {
      formData.append("difficulty_distribution", JSON.stringify(params.difficulty_distribution));
    }
    if (params.question_type_distribution) {
      formData.append("question_type_distribution", JSON.stringify(params.question_type_distribution));
    }
    if (params.language) formData.append("language", params.language);
    if (params.total_points !== undefined) {
      formData.append("total_points", String(params.total_points));
    }
    if (params.point_strategy) formData.append("point_strategy", params.point_strategy);
    if (params.prompt) formData.append("prompt", params.prompt);

    return quizHttpClient.post("/quiz/generate-from-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  generateFromFileExcel: (excelFile: File): Promise<QuizQuestion> => {
    const formData = new FormData();
    formData.append("excelFile", excelFile);

    return httpClient.post("QuizQuestion/parse-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
