/**
 * adds a estimate-number helper.
 */
export function estimateNumber(value) {
  const n = Number(String(value).replace(/\s+/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

