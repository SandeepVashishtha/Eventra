/**
 * adds a chunk-value helper.
 */
export function chunkValue(value, size) {
  const out = [];
  for (let i = 0; i < value.length; i += size) {
    out.push(value.slice(i, i + size));
  }
  return out;
}

