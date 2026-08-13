/**
 * adds a clamp-score helper.
 */
export function clampScore(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

