/**
 * adds a detect-time helper.
 */
export function detectTime(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

