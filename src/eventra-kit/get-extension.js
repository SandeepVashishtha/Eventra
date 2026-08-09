
/**
 * adds a file extension helper.
 */
export function getExtension(filename) {
  if (typeof filename !== 'string') return '';
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : '';
}

export function stripExtension(filename) {
  if (typeof filename !== 'string') return '';
  const idx = filename.lastIndexOf('.');
  return idx > 0 ? filename.slice(0, idx) : filename;
}

