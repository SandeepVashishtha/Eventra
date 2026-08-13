/**
 * adds a create-heap helper.
 */
export function createHeap(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

