import { AbstractIntlMessages } from "next-intl";

export async function loadMessages(
  locale: string
): Promise<AbstractIntlMessages> {
  const messages = (await import(`./locales/${locale}.json`))
    .default as AbstractIntlMessages;
  return messages;
}
