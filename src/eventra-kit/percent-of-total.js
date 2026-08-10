
/**
 * adds a share helper.
 */
export function percentOfTotal(part, total) {
  if (!total) return 0;
  return (part / total) * 100;
}

