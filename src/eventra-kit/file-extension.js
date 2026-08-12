
/**
 * adds a file extension helper.
 */
export function fileExtension(filename) {
  const match = String(filename).match(/\.([^.]+)$/);
  return match ? match[1] : '';
}

