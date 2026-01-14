"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCurrentLocale, useSetLocale } from "@/store";
import { locales, SupportedLocale } from "@/config/locales";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useCurrentLocale();
  const setLocale = useSetLocale();

  const handleLocaleChange = (locale: SupportedLocale) => {
    setLocale(locale);
    
    // Chuyển đổi URL
    const segments = pathname.split('/'); // pathname: /en/some/path -> ["", "en", "some", "path"]
    segments[1] = locale; // input: "vi"
    const newPath = segments.join('/'); // /vi/some/path
    router.push(newPath); // navigate to newPath
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 lg:gap-2 text-foreground p-1 sm:p-1.5 hover:text-primary-700 hover:bg-primary-50 transition-colors">
          <Globe className="h-4 w-4" />
          <span className="inline-block w-6 font-medium text-sm">
            {currentLocale.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(currentLocale === locale ? "bg-accent" : "", "group hover:bg-primary-100 hover:text-primary-700 transition-colors")}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{locale.toUpperCase()}</span>
              <span className="text-sm text-muted-foreground group-hover:text-primary-700 transition-colors">
                {locale === 'en' ? 'English' : 'Tiếng Việt'}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}