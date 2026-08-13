/**
 * adds a diff-word helper.
 */
export function diffWord(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

