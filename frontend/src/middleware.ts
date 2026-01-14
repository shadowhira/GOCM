import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale, localePrefix } from "@/config/locales";

console.log("Middleware loading locales...");

// Middleware này chạy trên server,
// nó cung cấp thông tin locale cho useLocale ở client

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

// Cấu hình để bỏ qua các đường dẫn không cần xử lý định tuyến locale
// ví dụ: /api, /_next/static, /favicon.ico, /assets, /locales, /themes, ...
export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|assets|locales|themes|templates).*)",
  ],
};
