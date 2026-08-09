/**
 * adds a deterministic string-color hash.
 */
export function stringToColor(str, palette) {
  if (typeof str !== 'string' || !str) return '#888888';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % (palette ? palette.length : 8);
  if (palette) return palette[index];
  return ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#f97316', '#22d3ee'][index];
}
