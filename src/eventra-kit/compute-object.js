/**
 * adds a compute-object helper.
 */
export function computeObject(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

