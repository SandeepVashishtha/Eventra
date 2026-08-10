
/**
 * adds a type grouping helper.
 */
export function groupByType(array) {
  const out = {};
  for (const item of array) {
    const t = Array.isArray(item) ? 'array' : typeof item;
    (out[t] = out[t] || []).push(item);
  }
  return out;
}

