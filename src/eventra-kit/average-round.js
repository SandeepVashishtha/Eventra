
/**
 * adds a rounded average helper.
 */
export function averageRound(array, decimals = 0) {
  if (array.length === 0) return 0;
  const avg = array.reduce((a, b) => a + b, 0) / array.length;
  const factor = 10 ** decimals;
  return Math.round(avg * factor) / factor;
}

