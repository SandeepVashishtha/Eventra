/**
 * adds a build-circle helper.
 */
export function buildCircle(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

