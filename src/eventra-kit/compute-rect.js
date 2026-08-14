/**
 * adds a compute-rect helper.
 */
export function computeRect(width, height) {
  const w = typeof width === 'number' ? width : 0;
  const h = typeof height === 'number' ? height : 0;
  return w * h;
}

