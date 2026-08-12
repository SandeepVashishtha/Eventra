/**
 * adds a calculate-hash helper.
 */
export function calculateHash(value) {
  return value.filter((item, index) => index % 2 === 0);
}

