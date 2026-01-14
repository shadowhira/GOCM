import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { quizApi } from "@/api/quizApi";
import type {
  GenerateFromPromptRequest,
  GenerateFromPromptResponse,
  GenerateFromFileResponse,
  GenerateFromFileParams,
  QuizQuestion,
} from "@/types/quiz";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/lib/api-error";

export function useGenerateQuizFromPrompt(
  options?: UseMutationOptions<
    GenerateFromPromptResponse,
    Error,
    GenerateFromPromptRequest
  >
) {
  const t = useTranslations();

  return useMutation({
    mutationFn: (data: GenerateFromPromptRequest) =>
      quizApi.generateFromPrompt(data),
    onSuccess: () => {
      toast.success(t("quiz_generated_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("quiz_generation_failed"), t)
      );
    },
    ...options,
  });
}

export function useGenerateQuizFromFile(
  options?: UseMutationOptions<
    GenerateFromFileResponse,
    Error,
    { file: File; params?: GenerateFromFileParams }
  >
) {
  const t = useTranslations();

  return useMutation({
    mutationFn: ({
      file,
      params,
    }: {
      file: File;
      params?: GenerateFromFileParams;
    }) => quizApi.generateFromFile(file, params || {}),
    onSuccess: () => {
      toast.success(t("quiz_generated_from_file_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("quiz_generation_from_file_failed"), t)
      );
    },
    ...options,
  });
}

export function useGenerateQuizFromFileExcel(
  options?: UseMutationOptions<QuizQuestion, Error, { excelFile: File }>
) {
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ excelFile }: { excelFile: File }) =>
      quizApi.generateFromFileExcel(excelFile),
    onSuccess: () => {
      toast.success(t("quiz_generated_from_excel_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("quiz_generation_from_excel_failed"), t)
      );
    },
    ...options,
  });
}
