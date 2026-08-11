/**
 * adds a collection grouping helper.
 */
export function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

export function keyBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = typeof keyFn === 'function' ? keyFn(item) : item[keyFn];
    acc[key] = item;
    return acc;
  }, {});
}
