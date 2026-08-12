/**
 * adds a check-html helper.
 */
export function checkHtml(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

