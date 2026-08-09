
/**
 * adds a safe division helper.
 */
export function safeDivide(a, b, fallback = 0) {
  if (b === 0) return fallback;
  return a / b;
}

