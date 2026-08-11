
/**
 * adds a case splitter.
 */
export function splitByCase(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_\s]+/g, ' ').trim().split(' ');
}

