
/**
 * adds a least common multiple helper.
 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

