
/**
 * adds a password strength score.
 */
export function isStrongPassword(password) {
  if (typeof password !== 'string') return false;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score >= 4;
}

