import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const XPProgressWheel = ({
  currentLevel,
  progressPercent,
  xpInCurrentLevel,
  xpNeededForNext,
  derivedXP,
  radius = 70,
}) => {
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card-bg/60 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-premium-md flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden"
    >
      <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />

      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-text-light">
        <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
        Rank Progression
      </div>

      <div className="relative w-[180px] h-[180px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="xpWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#f53f5e" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r={radius} className="stroke-border" strokeWidth="8" fill="none" />
          <motion.circle
            cx="80" cy="80" r={radius}
            stroke="url(#xpWheelGrad)"
            strokeWidth="8.5" strokeLinecap="round" fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-light">Level</span>
          <span className="text-3xl font-black text-text leading-none mt-1 tracking-tighter">{currentLevel}</span>
          <span className="text-[10px] font-bold text-primary mt-2 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="w-full pt-3 border-t border-border space-y-1">
        <div className="flex justify-between text-xs font-bold text-text-light">
          <span>XP in Level</span>
          <span className="text-text font-black">{xpInCurrentLevel} / 500</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-text-light">
          <span>Next Level In</span>
          <span className="text-primary font-black">{xpNeededForNext} XP</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-text-light/80 uppercase tracking-wider pt-2">
          <span>Total Accumulated</span>
          <span className="text-text font-extrabold">{derivedXP} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

export default XPProgressWheel;
