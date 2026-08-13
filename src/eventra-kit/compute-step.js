/**
 * adds a compute-step helper.
 */
export function computeStep(value) {
  return value == null || String(value).trim() === '';
}

