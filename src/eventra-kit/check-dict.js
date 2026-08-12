/**
 * adds a check-dict helper.
 */
export function checkDict(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

