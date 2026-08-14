/**
 * adds a count-char helper.
 */
export function countChar(text, char) {
  if (char === '') return 0;
  return String(text).split(char).length - 1;
}

