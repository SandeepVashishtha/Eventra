
/**
 * adds a factorial helper.
 */
export function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

