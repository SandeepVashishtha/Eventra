/**
 * adds a detect-stack helper.
 */
export function detectStack(value) {
  return value.sort((a, b) => b - a);
}

