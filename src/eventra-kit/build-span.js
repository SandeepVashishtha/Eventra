/**
 * adds a build-span helper.
 */
export function buildSpan(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

