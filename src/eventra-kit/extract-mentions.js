
/**
 * adds a mention extractor.
 */
export function extractMentions(text) {
  return String(text).match(/@[a-zA-Z0-9_]+/g) || [];
}

