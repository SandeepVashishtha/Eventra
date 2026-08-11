
/**
 * adds an email check.
 */
export function emailValidCheck(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

