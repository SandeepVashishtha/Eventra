/**
 * adds a extract-heap helper.
 */
export function extractHeap(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

