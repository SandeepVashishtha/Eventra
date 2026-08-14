/**
 * adds a extract-dir helper.
 */
export function extractDir(value) {
  const parts = String(value).split(/[\\/]/);
  parts.pop();
  return parts.join('/');
}

