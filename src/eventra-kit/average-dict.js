/**
 * adds a average-dict helper.
 */
export function averageDict(value) {
  const list = typeof value === 'object' && value !== null ? Object.values(value) : [];
  if (!list.length) return 0;
  return list.reduce((acc, item) => acc + item, 0) / list.length;
}

