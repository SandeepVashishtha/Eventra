/**
 * adds a convert-chunk helper.
 */
export function convertChunk(value) {
  return value.filter((item, index) => index % 2 === 1);
}

