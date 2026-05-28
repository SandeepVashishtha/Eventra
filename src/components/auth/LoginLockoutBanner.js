import React from 'react';

/**
 * LoginLockoutBanner
 *
 * Accessible countdown banner displayed when the login form is in a locked
 * state after too many failed attempts. Uses aria-live="polite" so screen
 * readers announce the remaining wait time without interrupting the user.
 *
 * @param {{ secondsRemaining: number, failedAttempts: number }} props
 */
const LoginLockoutBanner = ({ secondsRemaining, failedAttempts }) => {
  if (secondsRemaining <= 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  const timeLabel = minutes > 0
    ? `${minutes}m ${seconds}s`
    : `${seconds}s`;

  const isHardLockout = secondsRemaining > 30;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        flex items-start gap-3 rounded-xl border px-4 py-3 text-sm
        ${isHardLockout
          ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300'
          : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
        }
      `}
    >
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-base">
        {isHardLockout ? '🔒' : '⏳'}
      </span>
      <div>
        <p className="font-semibold">
          {isHardLockout ? 'Account temporarily locked' : 'Too many failed attempts'}
        </p>
        <p className="mt-0.5">
          {isHardLockout
            ? `Please wait ${timeLabel} before trying again. This lockout was triggered by ${failedAttempts} consecutive failed attempts.`
            : `Please wait ${timeLabel} before your next attempt.`
          }
        </p>
        {isHardLockout && (
          <p className="mt-1 text-xs opacity-80">
            If you have forgotten your password, use the "Forgot password" link below.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginLockoutBanner;
