/**
 * adds a build-count helper.
 */
export function buildCount(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

