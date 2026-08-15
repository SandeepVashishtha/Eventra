/**
 * adds a estimate-file helper.
 */
export function estimateFile(value) {
  return value.filter((item, index) => index % 2 === 0);
}

