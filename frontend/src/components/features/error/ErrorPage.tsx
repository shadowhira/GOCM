"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type ErrorCode = "403" | "404";

interface ErrorPageProps {
  code: ErrorCode;
}

/**
 * Reusable error page for 403/404 with consistent theming and i18n.
 */
export const ErrorPage = ({ code }: ErrorPageProps) => {
  const t = useTranslations();
  const router = useRouter();

  const isForbidden = code === "403";

  const title = isForbidden ? t("error_403_title") : t("error_404_title");
  const description = isForbidden
    ? t("error_403_description")
    : t("error_404_description");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center px-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border bg-card/90 shadow-xl backdrop-blur">
        <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_top_left,theme(colors.primary/20),transparent_45%),radial-gradient(circle_at_bottom_right,theme(colors.secondary/20),transparent_45%)]" />
        <div className="relative space-y-6 p-8">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-background/80">
            <span className="text-foreground/80">{code}</span>
            <span className="text-muted-foreground">{isForbidden ? "Forbidden" : "Not found"}</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="flex flex-wrap justify-between gap-3">
            <Button variant="secondary" onClick={() => router.back()}>
              {t("go_back")}
            </Button>
            <Button asChild>
              <Link href="/">{t("go_home")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
