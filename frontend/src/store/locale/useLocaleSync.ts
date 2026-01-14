"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useSetLocale } from "@/store";
import { isValidLocale, SupportedLocale } from "@/config/locales";

/**
 * Hook đơn giản để sync store với locale từ URL
 * Sử dụng trong layout hoặc component gốc
 */
export function useLocaleSync() {
  const urlLocale = useLocale(); // Locale từ URL (next-intl)
  const setLocale = useSetLocale();

  useEffect(() => {
    // Sync store với URL locale mỗi khi URL thay đổi
    if (isValidLocale(urlLocale)) {
      setLocale(urlLocale as SupportedLocale);
    }
  }, [urlLocale, setLocale]); // Chỉ chạy khi urlLocale thay đổi hoặc user nhấn đổi locale (setLocale thay đổi)
}
