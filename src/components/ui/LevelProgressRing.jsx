import React from 'react';
import { motion } from 'framer-motion';

export default function LevelProgressRing({ level, currentXP, requiredXP = 100, percentage }) {
  // SVG Ring Configuration
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // Approx 376.99
  
  // Calculate dash offset representing progress
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 dark:bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl w-full max-w-sm mx-auto select-none">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Glow effect back drop */}
        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        
        <svg className="w-full h-full transform -rotate-90 select-none pointer-events-none" viewBox="0 0 150 150">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          
          {/* Background circle track */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Animated active progress circle path */}
          <motion.circle
            cx="75"
            cy="75"
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 15,
            }}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Absolute center stats label */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            key={level}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="text-[10px] font-black uppercase text-indigo-400 tracking-widest"
          >
            Level
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={`lvl-${level}`}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="text-4xl font-extrabold text-white tracking-tighter my-0.5"
          >
            {level}
          </motion.div>
          
          <div className="text-[10px] font-black text-slate-400 tracking-wider">
            {currentXP} / {requiredXP} XP
          </div>
        </div>
      </div>
      
      {/* Footer text */}
      <div className="mt-4 w-full text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          XP to Level Up: <span className="font-extrabold text-indigo-400">{requiredXP - currentXP} XP</span>
        </div>
        
        {/* Visual progress bar at footer for reinforcement */}
        <div className="mt-2.5 w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
