/**
 * adds a compute-tree helper.
 */
export function computeTree(value) {
  return String(value).replace(/[^\w]/gi, '');
}

