
/**
 * adds a bucket hash helper.
 */
export function bucketHash(text, bucketCount) {
  return hashToIndex(text, bucketCount);
}

