"use client";

import { useCurrentTheme, useSetTheme } from "@/store/theme/useThemeStore";
import { themes, SupportedTheme } from "@/config/themes";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [isMounted, setIsMounted] = useState(false);
  const currentTheme = useCurrentTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        aria-hidden
        className="flex h-9 items-center gap-2 rounded-md border border-border bg-muted px-3 opacity-60 animate-pulse"
      >
        <div className="h-4 w-4 rounded-full bg-muted" />
        <div className="hidden sm:block h-3 w-12 rounded-full bg-muted" />
        <div className="h-3 w-3 rounded-full bg-muted" />
      </div>
    );
  }

  const handleThemeChange = (theme: SupportedTheme) => {
    setTheme(theme);
  };

  const ThemeIcon = currentTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 lg:gap-2 text-foreground p-1 sm:p-1.5 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        >
          <ThemeIcon className="h-4 w-4" />
          <span className="hidden lg:inline-block text-sm font-medium capitalize">
            {currentTheme}
          </span>
          <ChevronDown className="h-3 w-3 hidden lg:block" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme}
            onClick={() => handleThemeChange(theme)}
            className={cn(
              currentTheme === theme ? "bg-accent" : "", 
              "group hover:bg-primary-100 hover:text-primary-700 transition-colors"
            )}
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="font-medium capitalize">{theme}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
