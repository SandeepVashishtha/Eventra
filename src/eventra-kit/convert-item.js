/**
 * adds a convert-item helper.
 */
export function convertItem(value) {
  return String(value).split('').reverse().join('');
}

