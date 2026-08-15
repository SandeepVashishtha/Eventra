/**
 * adds a ensure-weight helper.
 */
export function ensureWeight(value) {
  return value == null || String(value).trim() === '';
}

