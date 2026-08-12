/**
 * adds a check-key helper.
 */
export function checkKey(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

