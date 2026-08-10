
/**
 * adds a type counter.
 */
export function countByType(array) {
  const counts = {};
  for (const item of array) {
    const t = Array.isArray(item) ? 'array' : typeof item;
    counts[t] = (counts[t] || 0) + 1;
  }
  return counts;
}

