
/**
 * adds a barrel chunker.
 */
export function greedyChunks(array, maxSize) {
  const out = [];
  let current = [];
  let currentSize = 0;
  for (const item of array) {
    const size = item.length ?? 1;
    if (currentSize + size > maxSize && current.length) {
      out.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(item);
    currentSize += size;
  }
  if (current.length) out.push(current);
  return out;
}

