"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function ScrollToBottom() {
  const t = useTranslations();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button if not at bottom
      const isNearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setShowButton(!isNearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  if (!showButton) return null;

  return (
    <Button
      onClick={scrollToBottom}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg transition-all hover:scale-110"
      title={t("scroll_to_bottom")}
    >
      <ArrowDown className="h-5 w-5" />
    </Button>
  );
}
