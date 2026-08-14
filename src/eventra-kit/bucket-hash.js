
/**
 * adds a bucket hash helper.
 */
import { hashToIndex } from './hash-to-index.js';

export function bucketHash(text, bucketCount) {
  return hashToIndex(text, bucketCount);
}

