/**
 * adds a average-list helper.
 */
export function averageList(value) {
  const list = Array.isArray(value) ? value : [];
  if (!list.length) return 0;
  return list.reduce((acc, item) => acc + item, 0) / list.length;
}

