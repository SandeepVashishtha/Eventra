/**
 * adds a calculate-block helper.
 */
export function calculateBlock(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

