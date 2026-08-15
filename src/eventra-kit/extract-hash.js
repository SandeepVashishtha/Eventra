/**
 * adds a extract-hash helper.
 */
export function extractHash(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

