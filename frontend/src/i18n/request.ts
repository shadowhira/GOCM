import { getRequestConfig, RequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { isValidLocale } from "@/config/locales";
import { loadMessages } from "./utils";

export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  // 1. Kiểm tra tính hợp lệ của locale
  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  // 2. Tải các messages sử dụng helper function chung
  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
  };
});
