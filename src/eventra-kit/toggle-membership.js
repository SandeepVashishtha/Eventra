
/**
 * adds a membership toggle helper.
 */
export function toggleMembership(array, value) {
  const index = array.indexOf(value);
  if (index >= 0) return array.filter((v) => v !== value);
  return [...array, value];
}

