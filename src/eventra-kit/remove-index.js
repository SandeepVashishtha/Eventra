
/**
 * adds an index remover.
 */
export function removeIndex(array, index) {
  return array.filter((_, i) => i !== index);
}

