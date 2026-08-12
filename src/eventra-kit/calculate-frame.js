/**
 * adds a calculate-frame helper.
 */
export function calculateFrame(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

