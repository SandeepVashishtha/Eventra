/**
 * adds a detect-text helper.
 */
export function detectText(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

