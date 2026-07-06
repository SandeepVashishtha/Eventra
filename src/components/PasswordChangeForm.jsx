import React, { useState } from "react";
import { passwordAPI } from "../api/passwordAPI";
import toast from "react-hot-toast";

/**
 * Secure Password Change Form Component
 * Requires current password verification before allowing new password change
 * Implements strong password validation and security best practices
 */
export function PasswordChangeForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Validate password strength in real-time
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, newPassword: value }));

    if (value) {
      const validation = passwordAPI.validatePasswordStrength(value);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }
  };

  // Handle form submission with security checks
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Password confirmation is required";
    }

    if (formData.newPassword && formData.confirmPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Validate password strength
    if (formData.newPassword) {
      const validation = passwordAPI.validatePasswordStrength(formData.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = validation.issues.join(". ");
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prevent changing to same password
    if (formData.currentPassword === formData.newPassword) {
      setErrors({
        newPassword: "New password must be different from current password",
      });
      return;
    }

    // Submit to backend
    setIsLoading(true);
    try {
      await passwordAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(null);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to change password";
      setErrors({ form: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "text-gray-400";
    if (passwordStrength.issues.length > 3) return "text-red-500";
    if (passwordStrength.issues.length > 1) return "text-yellow-500";
    return "text-green-500";
  };

  const getPasswordStrengthLabel = () => {
    if (!passwordStrength) return "Enter a password";
    if (passwordStrength.issues.length > 3) return "Weak";
    if (passwordStrength.issues.length > 1) return "Fair";
    if (passwordStrength.issues.length === 1) return "Good";
    return "Strong";
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Change Password</h2>

      {/* Form Error */}
      {errors.form && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.form}
        </div>
      )}

      {/* Current Password Field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.currentPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your current password"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({
                ...prev,
                current: !prev.current,
              }))
            }
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.current ? "Hide" : "Show"}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          ⚠️ Required for security verification
        </p>
      </div>

      {/* New Password Field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={handleNewPasswordChange}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.newPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your new password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({
                ...prev,
                new: !prev.new,
              }))
            }
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.new ? "Hide" : "Show"}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
        )}

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Password strength:</span>
              <span className={`text-sm font-medium ${getPasswordStrengthColor()}`}>
                {getPasswordStrengthLabel()}
              </span>
            </div>
            {passwordStrength && passwordStrength.issues.length > 0 && (
              <ul className="text-xs text-gray-600 list-disc pl-5">
                {passwordStrength.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Confirm your new password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords((prev) => ({
                ...prev,
                confirm: !prev.confirm,
              }))
            }
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.confirm ? "Hide" : "Show"}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        {isLoading ? "Changing Password..." : "Change Password"}
      </button>

      {/* Security Note */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 text-xs p-3 rounded mt-4">
        <strong>🔒 Security:</strong> For your protection, you must verify your
        current password before changing it. Never share your password with anyone.
      </div>
    </form>
  );
}

export default PasswordChangeForm;
