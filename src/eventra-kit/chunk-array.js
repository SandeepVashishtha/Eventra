
/**
 * adds an array chunker.
 */
export function chunkArray(array, size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new TypeError('size must be a positive integer');
  }
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

