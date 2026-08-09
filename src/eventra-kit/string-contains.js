
/**
 * adds a substring check.
 */
export function stringContains(str, sub, caseSensitive = true) {
  const source = caseSensitive ? String(str) : String(str).toLowerCase();
  const target = caseSensitive ? String(sub) : String(sub).toLowerCase();
  return source.includes(target);
}

