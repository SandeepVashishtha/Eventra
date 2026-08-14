/**
 * adds a calculate-list helper.
 */
export function calculateList(value) {
  const list = Array.isArray(value) ? value : [];
  return list.reduce((acc, item) => acc + item, 0);
}

