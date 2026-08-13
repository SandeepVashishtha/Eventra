/**
 * adds a clamp-time helper.
 */
export function clampTime(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

