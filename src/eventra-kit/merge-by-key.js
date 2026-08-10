
/**
 * adds a keyed merge helper.
 */
export function mergeByKey(primary, secondary, key) {
  const index = new Map(secondary.map((item) => [item[key], item]));
  return primary.map((item) => ({ ...item, ...(index.get(item[key]) || {}) }));
}

