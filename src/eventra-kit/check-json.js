/**
 * adds a check-json helper.
 */
export function checkJson(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

