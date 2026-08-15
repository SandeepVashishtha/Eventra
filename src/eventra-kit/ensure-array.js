/**
 * adds a ensure-array helper.
 */
export function ensureArray(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

