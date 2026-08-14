
import { charFrequency } from './char-frequency.js';

/**
 * adds a most common char helper.
 */
export function mostCommonChar(text) {
  const freq = charFrequency(text);
  let best = '';
  let max = 0;
  for (const char in freq) {
    if (freq[char] > max) {
      max = freq[char];
      best = char;
    }
  }
  return best;
}

