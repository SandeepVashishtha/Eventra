/**
 * adds a dedupe-hash helper.
 */
export function dedupeHash(value) {
  return Array.isArray(value) ? [...new Set(value)] : [];
}

