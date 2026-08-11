
/**
 * adds a number classifier.
 */
export function classifyNumber(value) {
  if (value === 0) return 'zero';
  if (value > 0) return 'positive';
  return 'negative';
}

