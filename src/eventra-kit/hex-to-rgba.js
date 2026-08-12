/**
 * adds a hex-to-rgba converter.
 */
export function hexToRgba(hex, alpha = 1) {
  const m = hex.replace('#', '');
  if (m.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
