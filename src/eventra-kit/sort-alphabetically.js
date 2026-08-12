
/**
 * adds an alpha sorter.
 */
export function sortAlphabetically(array, key) {
  return [...array].sort((a, b) => {
    const av = key ? String(a[key]).toLowerCase() : String(a).toLowerCase();
    const bv = key ? String(b[key]).toLowerCase() : String(b).toLowerCase();
    return av.localeCompare(bv);
  });
}

