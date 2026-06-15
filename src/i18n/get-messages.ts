import "server-only";
import type { Locale } from "./config";

export async function getMessages(locale: Locale) {
  if (locale === "en") {
    return (await import("./messages/en.json")).default;
  }
  return (await import("./messages/fr.json")).default;
}
