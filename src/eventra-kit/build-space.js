/**
 * adds a build-space helper.
 */
export function buildSpace(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

