/**
 * api/auth/change-password.js
 *
 * Secure password change endpoint that requires verification of current password.
 * Prevents unauthorized password changes even with stolen session tokens.
 */

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Verify authentication
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Extract user from session/JWT
    const userId = req.session?.user?.id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not found in session' });
    }

    // 3. Validate request body
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Current password and new password are required',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: 'New password must be different from current password',
      });
    }

    // 4. Validate password strength
    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: 'New password does not meet requirements',
        errors: passwordErrors,
      });
    }

    // 5. Get user from database and verify current password
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 6. Verify current password matches
    const passwordMatches = await verifyPassword(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      // Log failed attempt for security audit
      console.warn(`Failed password verification attempt for user ${userId}`);
      return res.status(401).json({
        message: 'Current password is incorrect',
      });
    }

    // 7. Hash new password and update database
    const hashedPassword = await hashPassword(newPassword);
    const result = await updateUserPassword(userId, hashedPassword);

    if (!result.success) {
      return res.status(500).json({
        message: 'Failed to update password',
      });
    }

    // 8. Log password change for audit trail
    console.log(`Password changed for user ${userId} at ${new Date().toISOString()}`);

    // 9. Invalidate all other sessions (except current) for security
    // This forces re-authentication on other devices
    await invalidateOtherSessions(userId, req.session?.id);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      note: 'You have been logged out from other devices for security',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({
      message: 'Failed to change password',
      error: error.message,
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
