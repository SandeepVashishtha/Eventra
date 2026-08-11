
/**
 * adds a check digit helper.
 */
export function checkDigit(digits) {
  const sum = String(digits).split('').reduce((acc, d, i) => acc + Number(d) * (i % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

