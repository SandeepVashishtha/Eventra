/**
 * adds a chunk-leaf helper.
 */
export function chunkLeaf(value) {
  return String(value).split('').sort().join('');
}

