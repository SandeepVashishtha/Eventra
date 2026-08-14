/**
 * adds a ensure-number helper.
 */
export function ensureNumber(value) {
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

