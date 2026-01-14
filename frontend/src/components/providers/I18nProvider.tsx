'use client'; 

import { AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';

export default function I18nProvider({
  children,
  messages,
  locale,
}: {
  children: React.ReactNode;
  messages: AbstractIntlMessages;
  locale: string;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone='Asia/Ho_Chi_Minh'>
      {children}
    </NextIntlClientProvider>
  );
}