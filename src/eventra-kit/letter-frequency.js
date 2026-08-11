
/**
 * adds a letter frequency helper.
 */
export function letterFrequency(text) {
  const counts = {};
  for (const char of String(text).toLowerCase()) {
    if (/[a-z]/.test(char)) counts[char] = (counts[char] || 0) + 1;
  }
  return counts;
}

