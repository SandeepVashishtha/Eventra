
/**
 * adds a url extractor.
 */
export function extractUrls(text) {
  return String(text).match(/https?:\/\/[^\s]+/g) || [];
}

