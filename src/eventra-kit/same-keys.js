
/**
 * adds a key equality helper.
 */
export function sameKeys(a, b) {
  const keysA = Object.keys(a).sort();
  const keysB = Object.keys(b).sort();
  return keysA.length === keysB.length && keysA.every((k, i) => k === keysB[i]);
}

