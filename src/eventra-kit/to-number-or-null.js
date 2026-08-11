
/**
 * adds a number or null helper.
 */
export function toNumberOrNull(value) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

