/**
 * adds a compute-number helper.
 */
export function computeNumber(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

