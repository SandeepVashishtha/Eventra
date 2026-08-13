/**
 * adds a count-frame helper.
 */
export function countFrame(value) {
  return value.map((item, index) => ({ item, index }));
}

