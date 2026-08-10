
/**
 * adds decade-based date math.
 */
export function addDecades(date, decades) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + decades * 10);
  return d;
}

