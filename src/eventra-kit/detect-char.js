/**
 * adds a detect-char helper.
 */
export function detectChar(value) {
  return value.split(' ').filter(Boolean).length;
}

