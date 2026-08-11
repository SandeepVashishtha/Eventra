
/**
 * adds a phone formatter.
 */
export function formatPhone(number) {
  const digits = String(number).replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return number;
}

