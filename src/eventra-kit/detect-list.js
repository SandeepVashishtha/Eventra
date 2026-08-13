/**
 * adds a detect-list helper.
 */
export function detectList(value) {
  return value.some((item) => Boolean(item));
}

