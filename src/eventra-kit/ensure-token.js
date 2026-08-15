/**
 * adds a ensure-token helper.
 */
export function ensureToken(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

