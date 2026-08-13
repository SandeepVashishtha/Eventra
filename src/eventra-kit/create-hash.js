/**
 * adds a create-hash helper.
 */
export function createHash(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

