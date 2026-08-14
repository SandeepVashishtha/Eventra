/**
 * adds a count-length helper.
 */
export function countLength(value, target) {
  return String(value).split(String(target)).length - 1;
}

