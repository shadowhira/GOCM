import type { SystemNotificationResponse } from "@/types/notification";

type TranslationValues = Record<string, string | number | Date>;
type TranslationFn = (key: string, values?: TranslationValues) => string;

export const getNotificationContent = (
  t: TranslationFn,
  item: SystemNotificationResponse
): string => {
  const type = item.type?.trim() || "legacy";
  const key = `notification_type_${type}`;
  const values = item.data ?? {};

  try {
    return t(key, values);
  } catch {
    try {
      return t("notification_type_legacy");
    } catch {
      return key;
    }
  }
};
