/**
 * adds a build-step helper.
 */
export function buildStep(value) {
  return [...new Set(value)];
}

