import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format chuỗi ngày ISO sang định dạng "HH:mm dd/MM/yyyy"
 * @param isoString Chuỗi thời gian ISO, ví dụ: "2025-11-05T18:00:52+07:00"
 * @returns Chuỗi dạng "18:00 05/11/2025"
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return "";

  const date = parseBackendDateTime(isoString);
  if (!date) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format chuỗi ngày ISO sang định dạng "HH:mm dd/MM/yyyy"
 * @param isoString Chuỗi thời gian ISO, ví dụ: "2025-11-05T18:00:52+07:00"
 * @returns Chuỗi dạng "18:00 05/11/2025"
 */
export function formatLocalDateTime(isoString?: string | null): string {
  if (!isoString) return "";

  const date = parseBackendDateTime(isoString);
  if (!date) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format chỉ phần ngày "dd/MM/yyyy"
 */
export function formatDate(isoString?: string | null): string {
  if (!isoString) return "";

  const date = parseBackendDateTime(isoString);
  if (!date) return "";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format chỉ phần giờ "HH:mm"
 */
export function formatTime(isoString?: string | null): string {
  if (!isoString) return "";

  const date = parseBackendDateTime(isoString);
  if (!date) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Parse datetime string từ backend (UTC time nhưng không có timezone indicator)
 * Backend trả về format: "2025-11-15T02:45:21.58212" (UTC time nhưng thiếu 'Z')
 * Hàm này sẽ thêm 'Z' để báo cho JavaScript biết đây là UTC time
 * @param dateTimeString Chuỗi datetime từ backend
 * @returns Date object hoặc null nếu invalid
 */
export function parseBackendDateTime(
  dateTimeString?: string | null
): Date | null {
  if (!dateTimeString) {
    return null;
  }

  // Nếu string đã có timezone indicator (Z, +, -), parse trực tiếp
  if (
    dateTimeString.includes("Z") ||
    dateTimeString.includes("+") ||
    dateTimeString.match(/-\d{2}:\d{2}$/)
  ) {
    const parsed = new Date(dateTimeString);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // Nếu không có timezone indicator, thêm 'Z' để báo đây là UTC time
  const utcString = dateTimeString.endsWith("Z")
    ? dateTimeString
    : `${dateTimeString}Z`;
  const parsed = new Date(utcString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format datetime sang định dạng Việt Nam với date-fns
 * Tự động parse UTC time từ backend và hiển thị theo giờ local
 * @param dateTimeInput Date object hoặc ISO string từ backend
 * @param formatStr Format string cho date-fns, mặc định "dd/MM/yyyy - HH:mm"
 * @returns Chuỗi datetime đã format theo giờ local
 */
export function formatDateTimeVN(
  dateTimeInput?: Date | string | null,
  formatStr: string = "dd/MM/yyyy - HH:mm"
): string {
  if (!dateTimeInput) return "";

  let date: Date | null;

  if (typeof dateTimeInput === "string") {
    date = parseBackendDateTime(dateTimeInput);
  } else {
    date = dateTimeInput;
  }

  if (!date || Number.isNaN(date.getTime())) return "";

  // Import date-fns format dynamically is not ideal, so use toLocaleString as fallback
  // For components using date-fns, they should use parseBackendDateTime + format
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
