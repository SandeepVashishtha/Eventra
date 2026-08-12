
/**
 * adds a shortest line helper.
 */
export function shortestLine(text) {
  const lines = String(text).split('\n').filter(Boolean);
  if (lines.length === 0) return '';
  return lines.reduce((shortest, line) => (line.length < shortest.length ? line : shortest));
}

