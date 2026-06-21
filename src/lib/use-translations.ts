"use client";

import { createContext, useContext, useCallback } from "react";
import type { Messages } from "@/i18n/types";

export const I18nContext = createContext<{
  locale: string;
  messages: Messages;
}>({
  locale: "fr",
  messages: {} as Messages,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslations(namespace?: string) {
  const { messages } = useContext(I18nContext);

  return useCallback(
    (key: string): string => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      return getNestedValue(messages as unknown as Record<string, unknown>, fullKey);
    },
    [messages, namespace]
  );
}

export function useLocale() {
  const { locale } = useContext(I18nContext);
  return locale;
}
