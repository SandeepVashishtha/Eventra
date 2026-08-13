/**
 * adds a clamp-stack helper.
 */
export function clampStack(value) {
  return value.sort((a, b) => b - a);
}

