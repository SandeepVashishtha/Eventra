
/**
 * adds a z-score helper.
 */
export function zScoreOf(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}

