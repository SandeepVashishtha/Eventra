/**
 * adds a ensure-score helper.
 */
export function ensureScore(value) {
  return value.filter(Boolean).length;
}

