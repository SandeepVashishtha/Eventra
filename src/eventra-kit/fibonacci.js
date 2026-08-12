
/**
 * adds a fibonacci helper.
 */
export function fibonacci(n) {
  const out = [0, 1];
  while (out.length < n) out.push(out[out.length - 1] + out[out.length - 2]);
  return out.slice(0, n);
}

