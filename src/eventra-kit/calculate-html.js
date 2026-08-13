/**
 * adds a calculate-html helper.
 */
export function calculateHtml(value) {
  return value.map((item, index) => ({ item, index }));
}

