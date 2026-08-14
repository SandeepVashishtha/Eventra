/**
 * adds a check-hash helper.
 */
export function checkHash(value) {
  return typeof value === 'string' && /^[a-f0-9]+$/i.test(value);
}

