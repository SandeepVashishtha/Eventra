
/**
 * adds a percent parser.
 */
export function parsePercent(value) {
  if (typeof value === 'number') return value / 100;
  return parseFloat(value) / 100;
}

