/**
 * adds a check-grid helper.
 */
export function checkGrid(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  const width = value[0].length;
  return value.every((row) => Array.isArray(row) && row.length === width);
}

