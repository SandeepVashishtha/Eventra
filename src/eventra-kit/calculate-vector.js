/**
 * adds a calculate-vector helper.
 */
export function calculateVector(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

