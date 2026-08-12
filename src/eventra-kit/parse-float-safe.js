
/**
 * adds a safe float parser.
 */
export function parseFloatSafe(text) {
  const n = parseFloat(text);
  return Number.isNaN(n) ? 0 : n;
}

