"use client";

import { useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "ocm-render-cold-start-toast";

export function ColdStartNotice() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasShown = sessionStorage.getItem(STORAGE_KEY);
    if (hasShown) return;

    sessionStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => {
        toast.info("Server is waking up", {
          description: "The app is hosted on Render; a cold start may take 1-2 minutes after idle time.",
          duration: 20000,
        });
    }, 100);
  }, []);

  return null;
}
