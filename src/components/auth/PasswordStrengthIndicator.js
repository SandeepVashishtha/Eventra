// src/components/auth/PasswordStrengthIndicator.js
import React from 'react';
import zxcvbn from 'zxcvbn';

const PasswordStrengthIndicator = ({ password }) => {
  const testResult = zxcvbn(password);
  const score = testResult.score; // Score from 0 to 4

  const getLabel = () => {
    switch (score) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getBarColor = () => {
    switch (score) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-orange-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getBarWidth = () => {
    // Width is score + 1 out of 5 levels (0, 1, 2, 3, 4)
    return `${((score + 1) / 5) * 100}%`;
  };

  return (
    <div className="w-full mt-2">
      <div className="relative w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-in-out ${getBarColor()}`}
          style={{ width: getBarWidth() }}
        ></div>
      </div>
      <p className="text-right text-sm mt-1">
        {password && ` ${getLabel()}`}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;