
/**
 * adds a password strength checker.
 */
export function validatePassword(password) {
  if (typeof password !== 'string') return { valid: false, errors: ['Invalid input'] };
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/\d/.test(password)) errors.push('One number');
  return { valid: errors.length === 0, errors };
}

