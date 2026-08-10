
/**
 * adds a deep flatten helper.
 */
export function flattenNested(array, depth = Infinity) {
  const result = [];
  const stack = [[array, 0]];
  while (stack.length) {
    const [current, d] = stack.pop();
    for (const item of current) {
      if (Array.isArray(item) && d < depth) stack.push([item, d + 1]);
      else result.push(item);
    }
  }
  return result.slice().reverse();
}

