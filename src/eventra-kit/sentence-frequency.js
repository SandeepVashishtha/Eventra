
/**
 * adds a sentence frequency helper.
 */
export function sentenceFrequency(text) {
  const counts = {};
  for (const sentence of String(text).split(/[.!?]+/).filter(Boolean)) {
    const word = sentence.trim();
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}

