
/**
 * adds an anagram check.
 */
export function areAnagrams(a, b) {
  const sort = (s) => String(s).split('').sort().join('');
  return sort(a) === sort(b);
}

