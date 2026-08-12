
/**
 * adds a lexicographic helper.
 */
export function lexicographicCompare(a, b) {
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

