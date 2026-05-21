// src/components/auth/PasswordStrengthIndicator.js
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const assessStrength = (password) => {
  const criteria = [
    { label: "At least 8 characters", met: password ? password.length >= 8 : false },
    { label: "One uppercase letter (A-Z)", met: password ? /[A-Z]/.test(password) : false },
    { label: "One lowercase letter (a-z)", met: password ? /[a-z]/.test(password) : false },
    { label: "One number (0-9)", met: password ? /\d/.test(password) : false },
    { label: "One special symbol (!@#$%^&*)", met: password ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : false }
  ];

  const criteriaMet = criteria.filter(c => c.met).length;
  
  let score;
  let feedback;

  if (criteriaMet === 5) {
    score = 3;
    feedback = 'Excellent! Your password meets all security criteria.';
  } else if (criteriaMet >= 3) {
    score = 2;
    feedback = 'Moderate strength. Add more complexity to meet all criteria.';
  } else {
    score = 1;
    feedback = 'Weak. Make sure your password meets the requirements.';
  }
  
  return { score, feedback, criteriaMet, criteria };
};

const PasswordStrengthIndicator = ({ password }) => {
  const { score, feedback, criteriaMet, criteria } = assessStrength(password);

  const getBarColorClass = (currentScore) => {
    switch (currentScore) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const strengthColorClass = score === 3 
    ? "text-green-600 dark:text-green-400" 
    : score === 2 
      ? "text-yellow-600 dark:text-yellow-400" 
      : "text-red-600 dark:text-red-400";

  return (
    <AnimatePresence>
      {password && (
        <motion.div
          className="mt-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Password strength:</span>
            <span className={`font-semibold ${strengthColorClass}`}>
              {criteriaMet}/5
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${getBarColorClass(score)}`}
              initial={{ width: "0%" }}
              animate={{
                width: `${(criteriaMet / 5) * 100}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <motion.p
            className={`text-xs mt-2 font-medium ${strengthColorClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {feedback}
          </motion.p>

          <ul className="mt-2.5 space-y-1 border-t border-gray-100 dark:border-gray-700/50 pt-2">
            {criteria.map((c, index) => (
              <li key={index} className="flex items-center gap-2 text-xs">
                {c.met ? (
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-[10px]">✓</span>
                ) : (
                  <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold text-[10px]">•</span>
                )}
                <span className={c.met ? "text-green-600/90 dark:text-green-400/90" : "text-gray-500 dark:text-gray-400"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordStrengthIndicator;