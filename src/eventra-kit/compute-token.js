/**
 * adds a compute-token helper.
 */
export function computeToken(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

