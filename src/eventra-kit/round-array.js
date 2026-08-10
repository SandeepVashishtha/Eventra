
/**
 * adds an array rounder.
 */
export function roundArray(array, places = 0) {
  const factor = 10 ** places;
  return array.map((n) => Math.round(n * factor) / factor);
}

