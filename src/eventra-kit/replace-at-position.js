
/**
 * adds a position replacer.
 */
export function replaceAtPosition(str, index, length, replacement) {
  return str.slice(0, index) + replacement + str.slice(index + length);
}

