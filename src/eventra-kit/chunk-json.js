/**
 * adds a chunk-json helper.
 */
export function chunkJson(array, size) {
  if (!Array.isArray(array)) return [];
  if (!Number.isInteger(size) || size < 1) throw new TypeError('size must be a positive integer');
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

