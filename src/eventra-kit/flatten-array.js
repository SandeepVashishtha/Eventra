
/**
 * adds an array flattener.
 */
export function flattenArray(array) {
  const out = [];
  for (const item of array) {
    if (Array.isArray(item)) out.push(...flattenArray(item));
    else out.push(item);
  }
  return out;
}

