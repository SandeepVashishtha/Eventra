
/**
 * adds a large number helper.
 */
export function formatLargeNumber(value) {
  const tiers = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
  for (let i = 0; i < tiers.length; i++) {
    const [divisor, suffix] = tiers[i];
    if (value >= divisor) {
      const v = Math.round((value / divisor) * 10) / 10;
      if (v >= 1000) {
        if (i === 0) return String(value);
        return `${(value / tiers[i - 1][0]).toFixed(1)}${tiers[i - 1][1]}`;
      }
      return `${v.toFixed(1)}${suffix}`;
    }
  }
  return String(value);
}

