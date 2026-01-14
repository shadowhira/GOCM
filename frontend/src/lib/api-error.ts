import { isAxiosError } from "axios";

type ApiErrorPayload = {
  code?: number | string;
  Code?: number | string;
  message?: string;
  Message?: string;
  errors?: string[] | Record<string, string[]>;
  Errors?: string[] | Record<string, string[]>;
  errorDetails?: Array<{ key: string; value: unknown }>;
  ErrorDetails?: Array<{ key: string; value: unknown }>;
};

type TranslateFn = (key: string) => string;

const EXCEPTION_CODE_TRANSLATIONS: Record<string, string> = {
  "1": "api_error_invalid_request",
  Invalidate: "api_error_invalid_request",
  "2": "api_error_not_found",
  NotFound: "api_error_not_found",
  "3": "api_error_duplicate",
  Duplicate: "api_error_duplicate",
  "4": "api_error_login_failed",
  LoginFailed: "api_error_login_failed",
  "400": "api_error_not_allowed",
  NotAllowUpdate: "api_error_not_allowed",
  "401": "api_error_unauthorized",
  Unauthorized: "api_error_unauthorized",
  "500": "api_error_server_error",
  InternalServerError: "api_error_server_error",
  "999": "api_error_unknown",
  UnKnow: "api_error_unknown",
};

const BACKEND_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Sai email hoặc mật khẩu!": "api_error_login_failed",
};

const safeTranslate = (translate: TranslateFn | undefined, key?: string) => {
  if (!translate || !key) {
    return null;
  }

  try {
    const translated = translate(key);
    // If translation returns the same key, it means translation is missing
    if (translated === key) {
      return null;
    }
    return translated;
  } catch (error) {
    console.warn("Missing translation key", key, error);
    return null;
  }
};

const toArray = (
  value?: string[] | Record<string, string[]>
): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return Object.values(value)
    .flatMap((items) => items)
    .filter(Boolean);
};

const normalizeMessage = (message?: string): string | null => {
  if (typeof message !== "string") {
    return null;
  }

  const trimmed = message.trim();
  return trimmed.length ? trimmed : null;
};

const translateByCode = (
  code: unknown,
  translate?: TranslateFn
): string | null => {
  if (code === undefined || code === null) {
    return null;
  }

  const normalized =
    typeof code === "number" ? code.toString() : String(code).trim();

  const translationKey = EXCEPTION_CODE_TRANSLATIONS[normalized];
  return translationKey ? safeTranslate(translate, translationKey) : null;
};

const translateBackendMessage = (
  message: string | null,
  translate?: TranslateFn
): string | null => {
  if (!message) {
    return null;
  }

  const translationKey = BACKEND_MESSAGE_TRANSLATIONS[message];
  return translationKey ? safeTranslate(translate, translationKey) : null;
};

const extractErrorDetailMessage = (
  details?: Array<{ key: string; value: unknown }>
): string | null => {
  if (!details || details.length === 0) {
    return null;
  }

  const firstDetail = details.find((detail) => typeof detail.value === "string");
  return typeof firstDetail?.value === "string"
    ? firstDetail.value
    : null;
};

/**
 * Extract errorKey from API error response's errorDetails
 * Backend sends errorKey in ErrorDetails array with key="errorKey"
 * Example: ErrorDetails: [{ key: "errorKey", value: "error_assignment_not_found" }]
 */
export const extractErrorKey = (error: unknown): string | null => {
  if (!isAxiosError<ApiErrorPayload>(error)) {
    return null;
  }

  const details = error.response?.data?.errorDetails ?? error.response?.data?.ErrorDetails;
  if (!details || details.length === 0) {
    return null;
  }

  const errorKeyDetail = details.find(
    (detail) => detail.key === "errorKey" && typeof detail.value === "string"
  );

  return errorKeyDetail?.value as string | null;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
  translate?: TranslateFn
): string => {
  if (!error) {
    return fallbackMessage;
  }

  if (isAxiosError<ApiErrorPayload>(error)) {
    const data = error.response?.data;

    // Priority 1: Try to get errorKey from ErrorDetails and translate it
    const errorKey = extractErrorKey(error);
    if (errorKey) {
      const translatedFromKey = safeTranslate(translate, errorKey);
      if (translatedFromKey) {
        return translatedFromKey;
      }
    }

    // Priority 2: Get from errors array (surface BE message first)
    const errors = toArray(data?.errors ?? data?.Errors);
    if (errors.length > 0) {
      return (
        translateBackendMessage(errors[0], translate) ?? errors[0]
      );
    }

    // Priority 3: Translate by exception code (fallback if BE message absent)
    const messageFromCode = translateByCode(
      data?.code ?? data?.Code,
      translate
    );
    if (messageFromCode) {
      return messageFromCode;
    }

    // Priority 4: Get from errorDetails (non-errorKey values)
    const detailMessage = extractErrorDetailMessage(
      data?.errorDetails ?? data?.ErrorDetails
    );
    if (detailMessage) {
      return (
        translateBackendMessage(detailMessage, translate) ?? detailMessage
      );
    }

    // Priority 5: Get from message field
    const message = normalizeMessage(data?.message ?? data?.Message);
    if (message) {
      return translateBackendMessage(message, translate) ?? message;
    }

    return error.message || fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};
