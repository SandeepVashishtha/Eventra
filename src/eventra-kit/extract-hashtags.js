
/**
 * adds a hashtag extractor.
 */
export function extractHashtags(text) {
  return String(text).match(/#[a-zA-Z0-9_]+/g) || [];
}

