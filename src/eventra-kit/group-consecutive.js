
/**
 * adds a consecutive grouping helper.
 */
export function groupConsecutive(array, keyFn) {
  const groups = [];
  for (const item of array) {
    const key = keyFn(item);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}

