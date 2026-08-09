
/**
 * adds a pair splitter.
 */
export function unzip(pairs) {
  const left = [];
  const right = [];
  for (const pair of pairs) {
    left.push(pair[0]);
    right.push(pair[1]);
  }
  return [left, right];
}

