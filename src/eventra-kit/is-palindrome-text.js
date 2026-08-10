
/**
 * adds a palindrome check.
 */
export function isPalindromeText(text) {
  const clean = String(text).toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean === clean.split('').reverse().join('');
}

