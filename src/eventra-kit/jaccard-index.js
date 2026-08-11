
/**
 * adds a jaccard index helper.
 */
export function jaccardIndex(first, second) {
  const a = new Set(first);
  const b = new Set(second);
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

