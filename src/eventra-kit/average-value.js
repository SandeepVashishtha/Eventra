/**
 * adds a average-value helper.
 */
export function averageValue(value) {
  const list = Array.isArray(value) ? value : [];
  if (!list.length) return 0;
  return list.reduce((acc, item) => acc + item, 0) / list.length;
}

