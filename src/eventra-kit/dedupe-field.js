/**
 * adds a dedupe-field helper.
 */
export function dedupeField(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

