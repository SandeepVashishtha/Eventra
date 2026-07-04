/**
 * api/auth/change-password.js
 *
 * Secure password change endpoint that requires verification of current password.
 * Prevents unauthorized password changes even with stolen session tokens.
 */

const isWrongMethod = (req) => req.method !== 'PUT';
const isMissingAuth = (req) => !req.headers.authorization;
const getUserId = (req) => req.session?.user?.id || req.user?.id;
const isMissingUser = (req) => !getUserId(req);
const isMissingFields = (req) => {
  const { currentPassword, newPassword } = req.body;
  return !currentPassword || !newPassword;
};
const isSamePassword = (req) => req.body.currentPassword === req.body.newPassword;

const REQUEST_VALIDATORS = [
  { test: isWrongMethod, status: 405, message: 'Method not allowed' },
  { test: isMissingAuth, status: 401, message: 'Unauthorized' },
  { test: isMissingUser, status: 401, message: 'User not found in session' },
  { test: isMissingFields, status: 400, message: 'Current password and new password are required' },
  { test: isSamePassword, status: 400, message: 'New password must be different from current password' },
];

function findValidationFailure(req) {
  return REQUEST_VALIDATORS.find((validator) => validator.test(req)) || null;
}

/**
 * Verify the caller's current password and persist the new one.
 * Throws a tagged error so the handler can map it to the right HTTP status.
 */
async function performPasswordChange(userId, currentPassword, newPassword, currentSessionId) {
  const user = await getUserById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const passwordMatches = await verifyPassword(currentPassword, user.passwordHash);
  if (!passwordMatches) {
    console.warn(`Failed password verification attempt for user ${userId}`);
    throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
  }

  const hashedPassword = await hashPassword(newPassword);
  const result = await updateUserPassword(userId, hashedPassword);
  if (!result.success) {
    throw Object.assign(new Error('Failed to update password'), { status: 500 });
  }

  console.log(`Password changed for user ${userId} at ${new Date().toISOString()}`);
  await invalidateOtherSessions(userId, currentSessionId);
}

export default async function handler(req, res) {
  const failure = findValidationFailure(req);
  if (failure) {
    return res.status(failure.status).json({ message: failure.message });
  }

  const { currentPassword, newPassword } = req.body;
  const passwordErrors = validatePasswordStrength(newPassword);
  if (passwordErrors.length > 0) {
    return res.status(400).json({
      message: 'New password does not meet requirements',
      errors: passwordErrors,
    });
  }

  try {
    const userId = getUserId(req);
    await performPasswordChange(userId, currentPassword, newPassword, req.session?.id);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      note: 'You have been logged out from other devices for security',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(error.status || 500).json({
      message: error.status ? error.message : 'Failed to change password',
      error: error.status ? undefined : error.message,
    });
  }
}

/**
 * Validate password strength requirements
 */
function validatePasswordStrength(password) {
  const errors = [];
  const minLength = 8;

  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return errors;
}

/**
 * Mock implementations - replace with actual database calls
 */

async function getUserById(userId) {
  // In production, query database: SELECT * FROM users WHERE id = userId
  // For mock: return user with hashed password
  return {
    id: userId,
    email: 'user@example.com',
    passwordHash: '$2b$10$mockHashedPassword123',
  };
}

async function verifyPassword(plainPassword, hashedPassword) {
  // In production, use bcrypt.compare(plainPassword, hashedPassword)
  // For mock: simple comparison
  return plainPassword === 'correct_password';
}

async function hashPassword(password) {
  // In production, use bcrypt.hash(password, 10)
  // For mock: prefix with mock_
  return `mock_hashed_${password}`;
}

async function updateUserPassword(userId, hashedPassword) {
  // In production: UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?
  // For mock: return success
  return {
    success: true,
    updatedAt: new Date().toISOString(),
  };
}

async function invalidateOtherSessions(userId, currentSessionId) {
  // In production: DELETE FROM sessions WHERE user_id = ? AND session_id != ?
  // For mock: log the operation
  console.log(`Invalidated other sessions for user ${userId}`);
  return true;
}
