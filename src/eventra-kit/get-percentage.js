
/**
 * adds a percentage helper.
 */
export function getPercentage(part, whole) {
  if (!whole) return 0;
  return (part / whole) * 100;
}

