
/**
 * adds a money parts helper.
 */
export function moneyParts(value) {
  const [whole, decimal] = value.toFixed(2).split('.');
  return { whole: Number(whole), decimal: Number(decimal) };
}

