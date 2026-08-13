/**
 * adds a dedupe-element helper.
 */
export function dedupeElement(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

