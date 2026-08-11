
/**
 * adds a name without ext helper.
 */
export function filenameWithoutExt(filename) {
  return String(filename).replace(/\.[^.]+$/, '');
}

