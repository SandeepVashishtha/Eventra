
/**
 * adds a transpose helper.
 */
export function transpose(arrays) {
  const length = Math.max(...arrays.map((a) => a.length));
  const out = [];
  for (let i = 0; i < length; i++) out.push(arrays.map((a) => a[i]));
  return out;
}

