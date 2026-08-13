
/**
 * adds an array equality helper.
 */
export function arrayEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function objectEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

