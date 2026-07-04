/**
 * passwordChangeService.js
 *
 * Secure password change service with current password verification.
 * Prevents unauthorized password changes even with stolen session tokens.
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class PasswordChangeService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL || 'http://localhost:8080/api',
      timeout: 15000,
    });

    this.minPasswordLength = 8;
    this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
      return errors;
    }

    if (password.length < this.minPasswordLength) {
      errors.push(`Password must be at least ${this.minPasswordLength} characters`);
    }

    if (!this.passwordRegex.test(password)) {
      errors.push('Password must contain uppercase, lowercase, number, and special character');
    }

    return errors;
  }

  /**
   * Validate that new password is different from current
   */
  validateNewPasswordDifference(currentPassword, newPassword) {
    if (currentPassword === newPassword) {
      return 'New password must be different from current password';
    }
    return null;
  }

  /**
   * Validate inputs locally before making a network request.
   * Returns a failure result object, or null if inputs are valid.
   */
  validateChangePasswordInputs(currentPassword, newPassword) {
    if (!currentPassword) {
      return { success: false, error: 'Current password is required' };
    }

    const strengthErrors = this.validatePasswordStrength(newPassword);
    if (strengthErrors.length > 0) {
      return { success: false, errors: strengthErrors };
    }

    const diffError = this.validateNewPasswordDifference(currentPassword, newPassword);
    if (diffError) {
      return { success: false, error: diffError };
    }

    return null;
  }

  /**
   * Map an axios error from the change-password endpoint to a user-facing result
   */
  mapChangePasswordError(error) {
    console.error('Password change error:', error);

    if (error.response?.status === 401) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (error.response?.status === 400) {
      return { success: false, error: error.response.data?.error || 'Invalid password format' };
    }

    return { success: false, error: error.message || 'Password change failed' };
  }

  /**
   * Change password with current password verification
   */
  async changePassword(currentPassword, newPassword) {
    const validationFailure = this.validateChangePasswordInputs(currentPassword, newPassword);
    if (validationFailure) {
      return validationFailure;
    }

    try {
      const response = await this.apiClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (!response.data?.success) {
        return {
          success: false,
          error: response.data?.error || 'Password change failed',
        };
      }

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      return this.mapChangePasswordError(error);
    }
  }

  /**
   * Get password requirements for UI
   */
  getPasswordRequirements() {
    return {
      minLength: this.minPasswordLength,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      specialChars: '@$!%*?&',
      message: `Password must be at least ${this.minPasswordLength} characters with uppercase, lowercase, number, and special character (@$!%*?&)`,
    };
  }
}

export const passwordChangeService = new PasswordChangeService();
