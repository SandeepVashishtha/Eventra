/**
 * Filter deep equality checks (#14082)
 */

export function areFiltersEqual(f1, f2) {
  if (!f1 || !f2) return false;
  return f1.category === f2.category && f1.search === f2.search && f1.date === f2.date;
}
