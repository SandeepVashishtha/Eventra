
/**
 * adds a quadratic helper.
 */
export function quadraticFormula(a, b, c) {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  return [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)];
}

