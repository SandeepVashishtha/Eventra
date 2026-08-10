/**
 * adds an array chunking helper.
 */
export function chunk(items, size) {
  const s = Math.max(1, Math.floor(size));
  const out = [];
  for (let i = 0; i < items.length; i += s) {
    out.push(items.slice(i, i + s));
  }
  return out;
}
