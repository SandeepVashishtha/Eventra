
/**
 * adds a safe integer helper.
 */
export function toSafeInteger(value) {
  return Math.max(-9007199254740991, Math.min(9007199254740991, Math.round(value)));
}

