import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuestCenter from '../components/gamification/QuestCenter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  Zap,
  Calendar,
  Lock,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Trophy,
} from 'lucide-react';

export default function UserAchievements() {
  useDocumentTitle("Eventra | Achievements");
  const { achievements, fetchAchievements } = useNotification();
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Fallback / Normalized list of milestone achievements with progress metrics
  const fallbackBadges = [
    {
      id: 'first-step',
      name: 'First Step',
      description: 'Registered for your first event on Eventra!',
      icon: '🚀',
      currentProgress: Math.min(1, achievements.totalEvents || 0),
      targetProgress: 1,
      earned: (achievements.totalEvents || 0) >= 1,
      rewardXP: 100,
      details: 'Kickstart your open-source registration journey. Join any workshop or hackathon to claim this token.',
      log: ['+100 XP awarded', 'Profile Starter badge enabled'],
    },
    {
      id: 'event-enthusiast',
      name: 'Event Enthusiast',
      description: 'Registered for 5 separate platform events and meetups.',
      icon: '🔥',
      currentProgress: achievements.totalEvents || 0,
      targetProgress: 5,
      earned: (achievements.totalEvents || 0) >= 5,
      rewardXP: 250,
      details: 'Attend workshops, webinars, and hackathons. Build consistency across local communities.',
      log: ['+250 XP awarded', 'Community Enthusiast badge enabled'],
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintained a multi-event active registration streak.',
      icon: '👑',
      currentProgress: achievements.currentStreak || 0,
      targetProgress: 3,
      earned: (achievements.currentStreak || 0) >= 3,
      rewardXP: 300,
      details: 'Register for events on consecutive schedules. Streaks scale your multiplier benefits.',
      log: ['+300 XP awarded', 'Elite Streaker badge enabled'],
    },
    {
      id: 'gssoc-contributor',
      name: 'GSSoC Contributor',
      description: 'Register for GSSoC specialized repository hackathons.',
      icon: '💻',
      currentProgress: Math.min(achievements.totalEvents || 0, 2),
      targetProgress: 2,
      earned: (achievements.totalEvents || 0) >= 2,
      rewardXP: 200,
      details: 'Collaborate with global open-source developers and sync your GSSoC progress boards.',
      log: ['+200 XP awarded', 'GSSoC Specialist badge enabled'],
    },
    {
      id: 'ai-pioneer',
      name: 'AI Pioneer',
      description: 'Complete highly technical AI/Web3 workshops.',
      icon: '🔮',
      currentProgress: Math.min(achievements.totalEvents || 0, 4),
      targetProgress: 4,
      earned: (achievements.totalEvents || 0) >= 4,
      rewardXP: 400,
      details: 'Dive deep into AI integrations, blockchain, and next-generation Web3 protocols.',
      log: ['+400 XP awarded', 'AI Specialist badge enabled'],
    },
  ];

  const operationalBadges = achievements.badges && achievements.badges.length > 0
    ? achievements.badges.map((b, idx) => ({
        id: b.id || `badge-${idx}`,
        name: b.name,
        description: b.description,
        icon: b.icon || '🏆',
        currentProgress: b.earned ? 1 : 0,
        targetProgress: 1,
        earned: b.earned,
        rewardXP: 150,
        details: b.description,
        log: ['+150 XP awarded'],
      }))
    : fallbackBadges;

  // Derived dynamic XP Level Progression Engine
  const unlockedCount = operationalBadges.filter(b => b.earned).length;
  const totalEvents = achievements.totalEvents || 0;
  const currentStreak = achievements.currentStreak || 0;

  // Derived calculations: 100 XP per event, 150 XP per streak day, 250 XP per badge
  const derivedXP = (totalEvents * 100) + (currentStreak * 150) + (unlockedCount * 250) + 75;
  
  // Level system: 500 XP per Level
  const currentLevel = Math.floor(derivedXP / 500) + 1;
  const xpInCurrentLevel = derivedXP % 500;
  const progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / 500) * 100));
  const xpNeededForNext = 500 - xpInCurrentLevel;

  // SVG Radial Circle metrics
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.8
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  const toggleExpand = (badgeId) => {
    setExpandedBadgeId(expandedBadgeId === badgeId ? null : badgeId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-650 dark:text-indigo-400 font-black text-xs tracking-wider uppercase">
              <Trophy className="w-4.5 h-4.5 animate-pulse" />
              Progression Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 bg-clip-text text-transparent bg-gradient-to-r from-slate-950 to-indigo-700 dark:from-slate-100 dark:to-indigo-400">
              Developer Achievements
            </h1>
            <p className="text-slate-550 dark:text-slate-400 mt-2 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Track your open-source growth milestones, streak multipliers, and XP progression. Claim developer tokens as you host, contribute, and engage in events.
            </p>
          </div>
        </div>

        {/* PROGRESSION ANALYTICS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* XP PROGRESS WHEEL CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-md flex flex-col items-center justify-center space-y-5 text-center relative overflow-hidden"
          >
            {/* Background absolute decorations */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -left-16 -bottom-16 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />

            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Rank Progression
>>>>>>> upstream/master
            </div>

            {/* Radial SVG Circle Wheel */}
            <div className="relative w-[180px] h-[180px] shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="xpWheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f53f5e" />
                  </linearGradient>
                </defs>

                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-slate-200/50 dark:stroke-slate-800/45"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Progress Ring */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="url(#xpWheelGrad)"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>

              {/* Center Glassmorphic Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</span>
                <span className="text-3xl font-black text-slate-850 dark:text-white leading-none mt-1 tracking-tighter">
                  {currentLevel}
                </span>
                <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 mt-2 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-100/30">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/40 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>XP in Level</span>
                <span className="text-slate-800 dark:text-slate-250 font-black">{xpInCurrentLevel} / 500</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Next Level In</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{xpNeededForNext} XP</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                <span>Total Accumulated</span>
                <span className="text-slate-700 dark:text-slate-300 font-extrabold">{derivedXP} XP</span>
              </div>
            </div>
          </motion.div>

          {/* ANALYTICS METRIC CARDS (COLSPAN: 2) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1: Attended */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[156px] hover:border-indigo-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Registrations
                </p>
                <p className="text-3xl font-black text-slate-850 dark:text-slate-100 mt-2.5 tracking-tight">
                  {totalEvents}
                </p>
              </div>
            </motion.div>

            {/* Card 2: Streaks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[156px] hover:border-pink-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-sm shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-pink-600 dark:text-pink-400 animate-pulse">
                  ACTIVE
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Streak Range
                </p>
                <p className="text-3xl font-black text-slate-850 dark:text-slate-100 mt-2.5 tracking-tight">
                  {currentStreak} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Events</span>
                </p>
              </div>
            </motion.div>

            {/* Card 3: Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[156px] hover:border-yellow-300 dark:hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-405 shadow-sm shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <CheckCircle className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
                  Tokens Claimed
                </p>
                <p className="text-3xl font-black text-slate-850 dark:text-slate-100 mt-2.5 tracking-tight">
                  {unlockedCount} <span className="text-xs text-slate-450 font-bold tracking-tight">/ {operationalBadges.length}</span>
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        {/* MILESTONE BADGES SECTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-850 pb-3">
            <h2 className="text-lg font-black tracking-tight text-slate-850 dark:text-slate-100">
              Milestone Badges & Trophy Cases
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {operationalBadges.map((badge) => {
              const isOpen = expandedBadgeId === badge.id;
              
              return (
                <motion.div
                  key={badge.id}
                  layout
                  className={`p-5 rounded-3xl border flex flex-col transition-all cursor-pointer ${
                    badge.earned
                      ? 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/40 shadow-sm hover:shadow-[0_12px_24px_rgba(99,102,241,0.06)]'
                      : 'bg-slate-100/55 dark:bg-slate-900/15 border-slate-200/30 dark:border-slate-850/20 opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => toggleExpand(badge.id)}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-3xl p-2.5 rounded-2xl shrink-0 shadow-xs ${badge.earned ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'bg-slate-200/50 dark:bg-slate-850 filter grayscale'}`}>
                      {badge.icon}
                    </span>
                    {badge.earned ? (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350 px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-100/35">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 mt-4 tracking-tight">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>

                  {/* Accordion expand indicator */}
                  <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-indigo-650 dark:text-indigo-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-850/40">
                    <span>Inspect Details</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.div>
                  </div>

                  {/* COLLAPSIBLE TROPHY ACCORDION DRAWER */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden space-y-4 pt-4 mt-3 border-t border-dashed border-slate-200 dark:border-slate-850/50"
                      >
                        {/* Requirement details */}
                        <div className="space-y-1">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
                            Milestone Requirement
                          </span>
                          <span className="block text-xs font-semibold text-slate-600 dark:text-slate-350 leading-relaxed mt-1">
                            {badge.details}
                          </span>
                        </div>

                        {/* Progress Bar indicator */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-wide text-slate-400">
                            <span>Progress status</span>
                            <span>{badge.currentProgress} / {badge.targetProgress}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200/50 dark:bg-slate-800/40 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (badge.currentProgress / badge.targetProgress) * 100)}%` }}
                              className={`h-full rounded-full bg-gradient-to-r ${badge.earned ? 'from-emerald-500 to-teal-500 shadow-xs' : 'from-indigo-500 to-indigo-650'}`}
                            />
                          </div>
                        </div>

                        {/* Log logs */}
                        <div className="space-y-2">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
                            Completion Log & Credits
                          </span>
                          <div className="space-y-1">
                            {(badge.log || []).map((logItem, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                                <span>{logItem}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Lock Warning if locked */}
                        {!badge.earned && (
                          <div className="flex items-center gap-1.5 p-2 px-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100/20 dark:border-rose-900/10 text-[9px] font-bold text-rose-600 dark:text-rose-400 leading-tight">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>Keep attending meetups and contributing to unlock this badge.</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Quest Center */}
        <QuestCenter
          totalEvents={achievements.totalEvents}
          currentStreak={achievements.currentStreak}
        />

      </div>
    </div>
  );
}