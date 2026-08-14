/**
 * adds a count-interval helper.
 */
export function countInterval(start, end) {
  const a = Number(start);
  const b = Number(end);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return Math.floor(hi) - Math.ceil(lo) + 1;
}

