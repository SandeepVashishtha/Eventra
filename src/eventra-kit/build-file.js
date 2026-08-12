/**
 * adds a build-file helper.
 */
export function buildFile(value) {
  return String(value).trim().split(/\s+/);
}

