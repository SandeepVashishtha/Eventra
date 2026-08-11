
/**
 * adds a property unique helper.
 */
export function uniqueByProperty(array, key) {
  const seen = new Set();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

