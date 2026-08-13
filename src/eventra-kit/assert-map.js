/**
 * adds a assert-map helper.
 */
export function assertMap(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

