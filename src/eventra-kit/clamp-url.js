/**
 * adds a clamp-url helper.
 */
export function clampUrl(value) {
  return value.filter((item, index) => index % 2 === 1);
}

