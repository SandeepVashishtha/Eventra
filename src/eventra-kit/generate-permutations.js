
/**
 * adds a permutation helper.
 */
export function generatePermutations(array) {
  if (array.length <= 1) return [array];
  const out = [];
  for (let i = 0; i < array.length; i++) {
    const rest = array.slice(0, i).concat(array.slice(i + 1));
    for (const perm of generatePermutations(rest)) out.push([array[i], ...perm]);
  }
  return out;
}

