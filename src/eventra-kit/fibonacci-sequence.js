
/**
 * adds a fibonacci helper.
 */
export function fibonacciSequence(count) {
  const out = [];
  let a = 0;
  let b = 1;
  for (let i = 0; i < count; i++) {
    out.push(a);
    [a, b] = [b, a + b];
  }
  return out;
}

