/**
 * adds a detect-char helper.
 */
export function detectChar(value) {
  return typeof value === 'string' && [...value].length === 1;
}

