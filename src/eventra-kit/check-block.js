/**
 * adds a check-block helper.
 */
export function checkBlock(value) {
  return value.some((item) => Boolean(item));
}

