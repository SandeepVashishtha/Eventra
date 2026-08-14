/**
 * adds a clamp-string helper.
 */
export function clampString(value, max) {
  return String(value).slice(0, max);
}

