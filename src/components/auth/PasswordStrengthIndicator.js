// src/components/auth/PasswordStrengthIndicator.js
import { AnimatePresence, motion } from 'framer-motion';
import useReducedMotion from '../../hooks/useReducedMotion';

const assessStrength = (password) => {
  const criteria = [
    { label: "At least 8 characters", met: password ? password.length >= 8 : false },
    { label: "Contains a number", met: password ? /\d/.test(password) : false },
    { label: "Contains uppercase letter", met: password ? /[A-Z]/.test(password) : false },
    { label: "Contains lowercase letter", met: password ? /[a-z]/.test(password) : false },
    { label: "Contains special character", met: password ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : false }
  ];

  const criteriaMet = criteria.filter(c => c.met).length;
  
  let score;
  let feedback;

  if (criteriaMet === 5) {
    score = 3;
    feedback = 'Excellent! Your password is secure and meets all criteria.';
  } else if (criteriaMet === 4) {
    score = 2;
    feedback = 'Almost there! Add a special character for full strength.';
  } else if (criteriaMet >= 3) {
    score = 2;
    feedback = 'Moderate strength. Add special characters or letters for better security.';
  } else {
    score = 1;
    feedback = 'Weak password. Follow the validation checklist below.';
  }
  
  return { score, feedback, criteriaMet, criteria };
};

const PasswordStrengthIndicator = ({ password }) => {
  const prefersReducedMotion = useReducedMotion();
  const { score, feedback, criteriaMet, criteria } = assessStrength(password);

  const getBarColorClass = (currentScore) => {
    switch (currentScore) {
      case 1:
        return 'bg-gradient-to-r from-red-500 to-rose-500 shadow-sm shadow-red-500/20';
      case 2:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-500/20';
      case 3:
        return 'bg-gradient-to-r from-emerald-500 to-green-500 shadow-sm shadow-green-500/20';
      default:
        return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  const strengthColorClass = score === 3 
    ? "text-emerald-600 dark:text-emerald-400" 
    : score === 2 
      ? "text-amber-600 dark:text-amber-400" 
      : "text-red-500 dark:text-red-400";

  const getStrengthLabel = (currentScore) => {
    switch (currentScore) {
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Strong';
      default:
        return 'Weak';
    }
  };

  return (
    <AnimatePresence>
      {password && (
        <motion.div
          className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          {/* Header Progress text */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">
              Password Strength: <span className={`font-extrabold ${strengthColorClass}`}>{getStrengthLabel(score)}</span>
            </span>
            <span className={`font-black ${strengthColorClass} px-2 py-0.5 rounded-md bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/20`}>
              {criteriaMet}/5 Passed
            </span>
          </div>

          {/* Smooth Dynamic Progress Bar */}
          <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <motion.div
              className={`h-full rounded-full transition-all duration-500 ${getBarColorClass(score)}`}
              initial={{ width: "0%" }}
              animate={{
                width: `${(criteriaMet / 5) * 100}%`,
              }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Feedback Text Description */}
          <motion.p
            className={`text-[11px] mt-2 font-medium ${strengthColorClass} leading-relaxed`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {feedback}
          </motion.p>

          {/* Responsive live 2-column checklist grid */}
          <ul className="mt-4 grid grid-cols-1 gap-2 border-t border-slate-200/40 pt-3 sm:grid-cols-2 dark:border-slate-800/40">
            {criteria.map((c, index) => (
              <li
                key={index}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all duration-300 ${
                  c.met
                    ? "bg-green-500/5 border-green-500/20 text-green-700 dark:text-green-400 shadow-sm shadow-green-500/5"
                    : "bg-slate-100/30 dark:bg-slate-800/20 border-slate-100/50 dark:border-slate-800/50 text-slate-400 dark:text-slate-500"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black transition-all duration-300 ${
                    c.met
                      ? "bg-green-500 text-white scale-110"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {c.met ? "✓" : "•"}
                </span>
                <span className="truncate font-semibold">{c.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordStrengthIndicator;
