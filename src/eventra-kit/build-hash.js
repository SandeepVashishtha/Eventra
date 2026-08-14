/**
 * adds a build-hash helper.
 */
export function buildHash(value) {
  return String(value)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

