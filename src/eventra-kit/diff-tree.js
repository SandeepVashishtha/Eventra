/**
 * adds a diff-tree helper.
 */
export function diffTree(value) {
  return String(value).replace(/[^\w]/gi, '');
}

