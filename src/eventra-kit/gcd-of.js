
/**
 * adds a gcd helper.
 */
export function gcdOf(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}

