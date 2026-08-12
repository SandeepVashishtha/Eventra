/**
 * adds a build-name helper.
 */
export function buildName(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

