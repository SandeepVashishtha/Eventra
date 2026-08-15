/**
 * adds a detect-score helper.
 */
export function detectScore(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

