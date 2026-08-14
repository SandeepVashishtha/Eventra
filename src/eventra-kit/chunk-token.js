/**
 * adds a chunk-token helper.
 */
export function chunkToken(value, size) {
  const text = String(value);
  const out = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out;
}

