/**
 * adds a text-color contrast helper.
 */
export function getContrastText(hex) {
  const m = hex.replace('#', '');
  if (m.length !== 6) return '#000000';
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
