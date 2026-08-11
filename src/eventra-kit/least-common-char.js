
/**
 * adds a least common char helper.
 */
export function leastCommonChar(text) {
  const freq = charFrequency(text);
  let best = '';
  let min = Infinity;
  for (const char in freq) {
    if (freq[char] < min) {
      min = freq[char];
      best = char;
    }
  }
  return best;
}

