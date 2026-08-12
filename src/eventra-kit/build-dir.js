/**
 * adds a build-dir helper.
 */
export function buildDir(value) {
  return value.filter((item, index) => index % 2 === 0);
}

