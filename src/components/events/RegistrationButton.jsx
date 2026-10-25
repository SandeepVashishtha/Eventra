import React from 'react';

export const RegistrationButton = ({ isPaused, pauseReason, resumeDate, onRegister }) => {
  const buttonText = isPaused ? "Registration Temporarily Paused" : "Register Now";

  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <button
        disabled={isPaused}
        onClick={onRegister}
        className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all shadow-md ${
          isPaused
            ? 'bg-amber-500/80 cursor-not-allowed opacity-90'
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
        }`}
      >
        {buttonText}
      </button>

      {isPaused && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
          {pauseReason && (
            <p><span className="font-semibold">Reason:</span> {pauseReason}</p>
          )}
          {resumeDate && (
            <p><span className="font-semibold">Expected Resume:</span> {new Date(resumeDate).toLocaleString()}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationButton;
