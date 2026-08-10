
/**
 * adds a number extractor.
 */
export function extractNumbers(text) {
  const matches = String(text).match(/-?\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

