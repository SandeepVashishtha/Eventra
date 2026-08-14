/**
 * adds a diff-object helper.
 */
export function diffObject(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

