
/**
 * adds a number or null helper.
 */
export function toNumberOrNull(value) {
  if (value === null || value === undefined || value === false) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

