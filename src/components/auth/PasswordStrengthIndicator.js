// src/components/auth/PasswordStrengthIndicator.js
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const assessStrength = (password) => {
  if (!password) {
    return { score: 0, feedback: 'Start typing your password.', criteriaMet: 0 };
  }

  let criteriaMet = 0;
  let feedback = [];

  if (password.length >= 8) {
      criteriaMet++;
  } else {
      feedback.push('Password must be at least 8 characters long.');
  }

  if (/[A-Z]/.test(password)) {
    criteriaMet++;
  } else {
    feedback.push('Add an uppercase letter.');
  }

  if (/[a-z]/.test(password)) {
    criteriaMet++;
  } else {
    feedback.push('Add a lowercase letter.');
  }

  if (/\d/.test(password)) {
    criteriaMet++;
  } else {
    feedback.push('Add a number.');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    criteriaMet++;
  } else {
    feedback.push('Add a special symbol.');
  }
  
  const rawScore = criteriaMet; 
  let strengthScore;
  let strengthFeedback;

  if (rawScore === 5) {
    strengthScore = 3;
    strengthFeedback = 'Excellent! Your password meets all security criteria.';
  } else if (rawScore >= 3) {
    strengthScore = 2;
    strengthFeedback = 'Moderate strength. You still need to ' + feedback[0].toLowerCase();
  } else {
    strengthScore = 1;
    strengthFeedback = 'Weak, ' + feedback[0].toLowerCase();
  }
  
  return { score: strengthScore, feedback: strengthFeedback, criteriaMet };
};


const PasswordStrengthIndicator = ({ password }) => {
  const strengthResult = assessStrength(password);
  const { score, feedback, criteriaMet } = strengthResult;

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
          className="mt-1"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Password criteria met:</span>
            <span className={strengthColorClass.replace('dark:', '').replace('text-', '').replace('400', '600')}>
              {criteriaMet}/5
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
            <motion.div
              className={`h-1.5 rounded-full ${getBarColorClass(score)}`}
              initial={{ width: "0%" }}
              animate={{
                width: `${(criteriaMet / 5) * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          <motion.p
            className={`text-xs mt-1 ${strengthColorClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {feedback}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordStrengthIndicator;