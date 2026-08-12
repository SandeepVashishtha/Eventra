
/**
 * adds a factorial helper.
 */
export function factorialOf(value) {
  if (value < 0) return 0;
  let out = 1;
  for (let i = 2; i <= value; i++) out *= i;
  return out;
}

