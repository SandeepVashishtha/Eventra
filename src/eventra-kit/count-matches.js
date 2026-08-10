
/**
 * adds a regex match counter.
 */
export function countMatches(text, regex) {
  const matches = String(text).match(regex);
  return matches ? matches.length : 0;
}

