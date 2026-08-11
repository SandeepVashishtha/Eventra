
/**
 * adds a stable sort helper.
 */
export function stableSortBy(array, getKey) {
  return array
    .map((item, index) => ({ item, index, key: getKey(item) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.index - b.index))
    .map((entry) => entry.item);
}

