
/**
 * adds a divisor finder.
 */
export function getDivisors(n) {
  const out = [];
  for (let i = 1; i <= Math.abs(n); i++) {
    if (n % i === 0) out.push(i);
  }
  return out;
}

