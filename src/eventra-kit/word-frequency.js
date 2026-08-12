
/**
 * adds a word frequency helper.
 */
export function wordFrequency(text) {
  const counts = {};
  for (const word of String(text).toLowerCase().match(/[a-z0-9']+/g) || []) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}

