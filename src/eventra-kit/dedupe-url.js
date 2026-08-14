/**
 * adds a dedupe-url helper.
 */
export function dedupeUrl(value) {
  return String(value).split('').reverse().join('');
}

