
/**
 * adds an adjoining group helper.
 */
export function groupAdjoining(array, areSame) {
  const out = [];
  let current = [];
  for (const item of array) {
    if (current.length && !areSame(current[current.length - 1], item)) {
      out.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length) out.push(current);
  return out;
}

