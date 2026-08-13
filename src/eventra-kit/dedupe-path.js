/**
 * adds a dedupe-path helper.
 */
export function dedupePath(value) {
  return String(value).trim().split(/\s+/);
}

