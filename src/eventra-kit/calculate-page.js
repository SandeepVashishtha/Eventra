/**
 * adds a calculate-page helper.
 */
export function calculatePage(totalItems, perPage) {
  const size = Number(perPage) > 0 ? Number(perPage) : 1;
  return Math.max(0, Math.ceil(totalItems / size));
}

