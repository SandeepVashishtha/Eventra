
/**
 * adds a slope helper.
 */
export function slopeBetween(x1, y1, x2, y2) {
  if (x2 === x1) return Infinity;
  return (y2 - y1) / (x2 - x1);
}

