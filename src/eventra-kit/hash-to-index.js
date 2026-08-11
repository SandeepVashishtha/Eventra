
/**
 * adds a hash index helper.
 */
export function hashToIndex(text, bucketCount) {
  return hashStringToNumber(text) % bucketCount;
}

