/**
 * adds a clamp-string helper.
 */
export function clampString(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

