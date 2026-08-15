/**
 * adds a detect-url helper.
 */
export function detectUrl(value) {
  return value.filter((item, index) => index % 2 === 1);
}

