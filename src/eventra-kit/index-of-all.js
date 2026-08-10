
/**
 * adds an all-index finder.
 */
export function indexOfAll(array, target) {
  const out = [];
  array.forEach((value, i) => {
    if (value === target) out.push(i);
  });
  return out;
}

