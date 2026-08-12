/**
 * adds a build-word helper.
 */
export function buildWord(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

