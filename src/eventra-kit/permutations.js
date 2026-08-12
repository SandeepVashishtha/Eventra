
/**
 * adds a permutations helper.
 */
export function permutations(array) {
  if (array.length <= 1) return [array];
  const out = [];
  for (let i = 0; i < array.length; i++) {
    const rest = array.slice(0, i).concat(array.slice(i + 1));
    for (const p of permutations(rest)) out.push([array[i], ...p]);
  }
  return out;
}

