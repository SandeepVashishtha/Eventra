/**
 * adds a count-dir helper.
 */
export function countDir(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

