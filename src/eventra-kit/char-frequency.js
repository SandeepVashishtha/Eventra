
/**
 * adds a char counter.
 */
export function charFrequency(text) {
  const freq = {};
  for (const ch of String(text)) freq[ch] = (freq[ch] || 0) + 1;
  return freq;
}

