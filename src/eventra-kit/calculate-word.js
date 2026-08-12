/**
 * adds a calculate-word helper.
 */
export function calculateWord(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

