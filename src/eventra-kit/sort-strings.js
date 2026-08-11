
/**
 * adds a alpha sorter.
 */
export function sortStrings(array, descending = false) {
  return [...array].sort((a, b) => {
    const cmp = String(a).localeCompare(String(b));
    return descending ? -cmp : cmp;
  });
}

