/**
 * adds a clamp-text helper.
 */
export function clampText(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

