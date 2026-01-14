"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label, className }: BackButtonProps) {
  const t = useTranslations();
  const router = useRouter();

  // Prefetch the back URL immediately when component mounts
  useEffect(() => {
    router.prefetch(href);
  }, [router, href]);

  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn("mb-4 text-primary-600 hover:text-primary-700", className)}
    >
      <Link href={href} prefetch={true}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {label || t("back")}
      </Link>
    </Button>
  );
}
