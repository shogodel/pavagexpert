export interface SpamCheckResult {
  isSpam: boolean;
  reason: string;
}

const urlPattern = /https?:\/\/[^\s]+/gi;
const cryptoPattern = /\b(bitcoin|btc|eth|ethereum|crypto|binance|coinbase|wallet|private key|seed phrase|investment|guaranteed profit|earn money fast|work from home|make money online)\b/i;
const gibberishPattern = /(.)\1{5,}/;
const excessiveSpaces = /\s{4,}/;
const repeatedWords = /\b(\w+)\s+\1\s+\1\b/i;
const phoneNumberSpam = /\b(\d{3,}[\s\-]?){4,}\b/;
const excessiveNewlines = /\n{4,}/;
const allCapsLine = /^[A-Z\s]{20,}$/m;

export function checkContentSpam(description: string): SpamCheckResult {
  const urls = (description.match(urlPattern) || []).length;
  if (urls > 3) {
    return { isSpam: true, reason: `too_many_urls:${urls}` };
  }

  if (cryptoPattern.test(description)) {
    return { isSpam: true, reason: "crypto_keywords" };
  }

  if (gibberishPattern.test(description)) {
    return { isSpam: true, reason: "repeated_chars" };
  }

  if (excessiveSpaces.test(description)) {
    return { isSpam: true, reason: "excessive_spaces" };
  }

  if (repeatedWords.test(description)) {
    return { isSpam: true, reason: "repeated_words" };
  }

  if (phoneNumberSpam.test(description)) {
    return { isSpam: true, reason: "phone_number_spam" };
  }

  if (excessiveNewlines.test(description)) {
    return { isSpam: true, reason: "excessive_newlines" };
  }

  if (allCapsLine.test(description)) {
    return { isSpam: true, reason: "all_caps" };
  }

  return { isSpam: false, reason: "" };
}
