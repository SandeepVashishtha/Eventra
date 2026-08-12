
/**
 * adds a percent change helper.
 */
export function percentChange(before, after) {
  if (before === 0) return 0;
  return ((after - before) / before) * 100;
}

