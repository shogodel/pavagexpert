"use client";

import { ReactNode } from "react";
import { I18nContext } from "@/lib/use-translations";
import type { Messages } from "@/i18n/types";

export default function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Messages;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}
