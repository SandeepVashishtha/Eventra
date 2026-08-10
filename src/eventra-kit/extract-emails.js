
/**
 * adds an email extractor.
 */
export function extractEmails(text) {
  return String(text).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
}

