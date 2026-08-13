/**
 * adds a dedupe-heap helper.
 */
export function dedupeHeap(value) {
  return String(value).split('').sort().join('');
}

