
/**
 * adds a path normalizer.
 */
export function normalizePath(path) {
  return String(path).replace(/\\/g, '/').replace(/\/+/g, '/');
}

