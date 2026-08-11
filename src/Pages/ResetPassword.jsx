import React, { useState, useMemo } from 'react';

export const ResetPassword = ({ token, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Evaluate password complexity policy conditions
  const criteria = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
  }, [password]);

  // Compute password strength score (0 to 100%)
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: 'Empty', color: 'bg-gray-200 dark:bg-gray-700' };

    const passedCount = Object.values(criteria).filter(Boolean).length;

    if (passedCount <= 2) {
      return { score: 25, label: 'Weak', color: 'bg-red-500' };
    } else if (passedCount === 3 || passedCount === 4) {
      return { score: 65, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { score: 100, label: 'Strong', color: 'bg-green-500' };
    }
  }, [criteria, password]);

  const isMatching = password && confirmPassword && password === confirmPassword;
  const isValid = strength.score >= 65 && isMatching;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ token, password });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter a secure new password for your account.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Password successfully reset! You may now sign in with your new password.
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  placeholder="Enter new password"
                  required
                />
              </div>

              {/* Password Strength Visual Meter */}
              {password && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Strength:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Password Policy Checklist */}
              <div className="space-y-1.5 text-xs">
                <p className="font-medium text-gray-600 dark:text-gray-400">Password must contain:</p>
                <ul className="grid grid-cols-2 gap-1 text-gray-500 dark:text-gray-400">
                  <li className={criteria.minLength ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {criteria.minLength ? '✓' : '•'} At least 8 characters
                  </li>
                  <li className={criteria.hasUpper ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {criteria.hasUpper ? '✓' : '•'} Uppercase letter
                  </li>
                  <li className={criteria.hasLower ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {criteria.hasLower ? '✓' : '•'} Lowercase letter
                  </li>
                  <li className={criteria.hasNumber ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {criteria.hasNumber ? '✓' : '•'} Number
                  </li>
                  <li className={criteria.hasSpecial ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                    {criteria.hasSpecial ? '✓' : '•'} Special character
                  </li>
                </ul>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                  placeholder="Re-enter new password"
                  required
                />
                {confirmPassword && !isMatching && (
                  <p className="mt-1 text-xs text-red-500">Passwords do not match.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-colors ${
                isValid && !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
