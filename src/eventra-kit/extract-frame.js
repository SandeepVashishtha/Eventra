/**
 * adds a extract-frame helper.
 */
export function extractFrame(value) {
  return value.reduce((acc, item) => (item < acc ? item : acc), Infinity);
}

