/**
 * adds a calculate-gap helper.
 */
export function calculateGap(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

