
/**
 * adds a base converter.
 */
export function toBase(value, base) {
  return Number(value).toString(base);
}

export function fromBase(str, base) {
  return parseInt(str, base);
}

