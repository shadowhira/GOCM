import { notFound } from "next/navigation";
import { ReactNode } from "react";
import I18nProvider from "@/components/providers/I18nProvider";
import { LocaleStoreSyncer } from "@/components/providers/LocaleStoreSyncer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { NavigationProgress } from "@/components/providers/NavigationProgress";
import { isValidLocale } from "@/config/locales";
import "../globals.css";
import { Toaster } from "sonner";
import { loadMessages } from "@/i18n/utils";
import TanstackProvider from "@/components/providers/TanstackProvider";
import { Mulish } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locale || !isValidLocale(locale)) {
    notFound();
  }

  const messages = await loadMessages(locale);

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme-store');
                  const theme = stored ? JSON.parse(stored).state.theme : 'light';
                  const link = document.createElement('link');
                  link.id = 'app-theme-stylesheet';
                  link.rel = 'stylesheet';
                  link.href = '/themes/ocean-' + theme + '.css';
                  document.head.appendChild(link);
                } catch (e) {
                  const link = document.createElement('link');
                  link.id = 'app-theme-stylesheet';
                  link.rel = 'stylesheet';
                  link.href = '/themes/ocean-light.css';
                  document.head.appendChild(link);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={mulish.className}>
        <NextTopLoader
          color="#3b82f6"
          height={3}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        <NavigationProgress />
        <TanstackProvider>
          <I18nProvider messages={messages} locale={locale}>
            <LocaleStoreSyncer />
            <ThemeProvider />
            <Toaster position="top-right" richColors />
            {children}
          </I18nProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}
