
/**
 * adds a number coercion helper.
 */
export function toNumberOrZero(value) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

