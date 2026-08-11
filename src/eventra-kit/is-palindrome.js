
/**
 * adds a palindrome checker.
 */
export function isPalindrome(text) {
  if (typeof text !== 'string') return false;
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

