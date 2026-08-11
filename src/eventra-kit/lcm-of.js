
/**
 * adds an lcm helper.
 */
export function lcmOf(a, b) {
  return a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcdOf(a, b);
}

