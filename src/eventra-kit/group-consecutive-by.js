
/**
 * adds a consecutive grouping helper.
 */
export function groupConsecutiveBy(array, key) {
  const out = [];
  let current = [];
  let currentKey;
  for (const item of array) {
    const k = typeof key === 'function' ? key(item) : item[key];
    if (k !== currentKey) {
      if (current.length) out.push(current);
      current = [item];
      currentKey = k;
    } else {
      current.push(item);
    }
  }
  if (current.length) out.push(current);
  return out;
}

