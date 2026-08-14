/**
 * adds a create-path helper.
 */
export function createPath(parts) {
  return Array.isArray(parts) ? parts.join('/') : String(parts);
}

