import { apiUtils } from "../config/api";

/**
 * Secure password change API
 * Requires current password verification before accepting new password
 */
export const passwordAPI = {
  /**
   * Change user password with current password verification
   * @param {Object} credentials - Password change request
   * @param {string} credentials.currentPassword - User's current password for verification
   * @param {string} credentials.newPassword - New password to set
   * @param {string} credentials.confirmPassword - Password confirmation (for validation)
   * @returns {Promise} Response from password change endpoint
   */
  changePassword: async (credentials) => {
    if (!credentials.currentPassword) {
      throw new Error("Current password is required for security verification");
    }
    if (!credentials.newPassword) {
      throw new Error("New password is required");
    }
    if (credentials.newPassword !== credentials.confirmPassword) {
      throw new Error("New passwords do not match");
    }
    if (credentials.currentPassword === credentials.newPassword) {
      throw new Error("New password must be different from current password");
    }

    return apiUtils.put("/api/users/change-password", {
      currentPassword: credentials.currentPassword,
      newPassword: credentials.newPassword,
    });
  },

  /**
   * Validate password strength
   * Requirements: 8+ chars, uppercase, lowercase, number, special char
   */
  validatePasswordStrength: (password) => {
    const issues = [];

    if (!password || password.length < 8) {
      issues.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      issues.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      issues.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(password)) {
      issues.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      issues.push("Password must contain at least one special character");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },
};
