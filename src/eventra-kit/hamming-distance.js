
/**
 * adds a hamming distance helper.
 */
export function hammingDistance(first, second) {
  if (first.length !== second.length) return -1;
  let dist = 0;
  for (let i = 0; i < first.length; i++) if (first[i] !== second[i]) dist++;
  return dist;
}

