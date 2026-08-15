/**
 * adds a detect-step helper.
 */
export function detectStep(value) {
  return new Set(value).size;
}

