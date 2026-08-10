
/**
 * adds a size chunker.
 */
export function chunkBySize(items, sizeOf) {
  const out = [];
  let current = [];
  let currentSize = 0;
  for (const item of items) {
    const size = sizeOf(item);
    if (currentSize + size > 1 && current.length) {
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

