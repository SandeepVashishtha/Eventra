/**
 * adds a convert-array helper.
 */
export function convertArray(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

