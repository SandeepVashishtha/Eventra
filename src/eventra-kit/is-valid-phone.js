/**
 * adds a phone validation helper.
 */
export function isValidPhone(value, minDigits = 10) {
  if (typeof value !== 'string') return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= minDigits;
}
