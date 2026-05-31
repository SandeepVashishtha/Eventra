import { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import QuestCenter from '../components/gamification/QuestCenter';
import EventBadgeGenerator from '../components/user/EventBadgeGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
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
  Linkedin,
  Twitter,
  Share2,
  X,
} from 'lucide-react';

export default function UserAchievements() {
  useDocumentTitle("Eventra | Achievements");
  const { achievements, fetchAchievements } = useNotification();
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);
  const [activeShareBadge, setActiveShareBadge] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [shareStory, setShareStory] = useState("");
  const [sharePlatform, setSharePlatform] = useState("twitter");

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  useEffect(() => {
    if (activeShareBadge) {
      setShareStory(`I just unlocked the '${activeShareBadge.name}' milestone badge on Eventra! 🏆 ${activeShareBadge.description} Check it out: https://eventra.dev #GSSoC2026 #OpenSource #Developer`);
    } else {
      setShareStory("");
    }
  }, [activeShareBadge]);

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

  const handleShareTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareStory)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening Twitter/X share dialog!");
  };

  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://eventra.dev")}&summary=${encodeURIComponent(shareStory)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening LinkedIn share dialog!");
  };

  
  // Mock download badge certificate SVG
  const handleDownloadSVG = (badge) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250">
      <rect width="100%" height="100%" fill="#0f172a" rx="20"/>
      <circle cx="200" cy="80" r="40" fill="#1e1b4b" stroke="#6366f1" stroke-width="2"/>
      <text x="200" y="88" font-family="Arial" font-size="36" text-anchor="middle" fill="#fff">${badge.icon}</text>
      <text x="200" y="150" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#e2e8f0">${badge.name}</text>
      <text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle" fill="#94a3b8">EVENTRA ACHIEVER TOKEN</text>
      <text x="200" y="205" font-family="Arial" font-size="10" text-anchor="middle" fill="#6366f1">Level ${currentLevel} Developer</text>
    </svg>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${badge.id}-certificate.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Certificate Badge graphic downloaded!");
  };

  // Onboarding Checklist configuration
  const onboardingQuests = [
    { id: 'step1', title: 'Register for your first event', description: 'Unlock your first registration milestone', done: totalEvents >= 1 },
    { id: 'step2', title: 'Start a streak', description: 'Participate in multiple events consecutively', done: currentStreak >= 1 },
    { id: 'step3', title: 'Unlock a milestone token', description: 'Complete requirements to claim a badge', done: unlockedCount >= 1 },
  ];

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
          <div className="shrink-0">
            <button
              onClick={() => setIsBadgeModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>Attendee Badge Center</span>
            </button>
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

        {/* ONBOARDING CHECKLIST FOR USERS WITH ZERO ACHIEVEMENTS */}
        {unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-900/40 via-purple-900/35 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl rounded-3xl p-6 shadow-lg space-y-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-450 animate-bounce" />
              <h2 className="text-md font-black tracking-tight text-white uppercase">
                Gamified Onboarding Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-350 max-w-xl leading-relaxed">
              You haven&apos;t unlocked any milestone tokens yet. Complete the steps below to claim your first developer badge:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {onboardingQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-4 rounded-2xl border transition ${
                    quest.done
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-350"
                      : "bg-slate-950/40 border-slate-900 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Quest</span>
                    {quest.done ? (
                      <span className="bg-emerald-500/20 text-emerald-450 px-2 py-0.5 rounded text-[8px] font-black uppercase">COMPLETED</span>
                    ) : (
                      <span className="bg-slate-800/80 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">PENDING</span>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-white">{quest.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">{quest.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

                        {/* Share section */}
                        {badge.earned && (
                          <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-850/50 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                            <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">
                              Share Achievement
                            </span>
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              <button
                                onClick={() => setActiveShareBadge(badge)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white transition-all cursor-pointer shadow-xs hover:scale-[1.03]"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Share Certificate</span>
                              </button>
                            </div>
                          </div>
                        )}

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

      {/* SHARE CARD GENERATOR OVERLAY MODAL */}
      <AnimatePresence>
        {activeShareBadge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl relative space-y-5 text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveShareBadge(null)}
                className="absolute right-5 top-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>

              <div className="space-y-1">
                <h3 className="text-md font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Share2 className="w-4 h-4 animate-pulse" /> Social Achievement Builder
                </h3>
                <p className="text-xs text-slate-400">Customize your milestone story and preview how it appears on social feeds before posting.</p>
              </div>

              {/* Dual-Pane Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Column 1: Message Customizer & Controls */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Customize Your Story
                    </label>
                    <textarea
                      value={shareStory}
                      onChange={(e) => setShareStory(e.target.value)}
                      rows={4}
                      className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-slate-200 resize-none outline-none transition-all leading-relaxed"
                      placeholder="Share your open-source journey..."
                    />
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>Interactive Composer</span>
                      <span className={shareStory.length > 280 ? "text-rose-500 font-extrabold" : ""}>
                        {shareStory.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Quick Emojis & Hashtags Helpers */}
                  <div className="space-y-1.5">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Quick Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["#GSSoC2026", "#OpenSource", "#DevLife", "#LearnToCode"].map(tag => (
                        <button
                          key={tag}
                          onClick={() => {
                            if (!shareStory.includes(tag)) {
                              setShareStory(prev => `${prev.trim()} ${tag}`);
                            }
                          }}
                          className="px-2.5 py-1 text-[9px] font-extrabold rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800/60 transition cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleShareTwitter}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 text-xs font-bold text-slate-300 transition cursor-pointer"
                      >
                        <Twitter size={13} className="text-sky-400" />
                        <span>Post on X</span>
                      </button>
                      <button
                        onClick={handleShareLinkedIn}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-850 text-xs font-bold text-slate-330 transition cursor-pointer"
                      >
                        <Linkedin size={13} className="text-blue-500" />
                        <span>Share LinkedIn</span>
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareStory);
                          toast.success("Social story copied to clipboard! 📋");
                        } catch {
                          toast.error("Failed to copy story.");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800/80 text-xs font-bold text-slate-200 transition cursor-pointer"
                    >
                      <CheckCircle size={13} className="text-emerald-500" />
                      <span>Copy Story to Clipboard</span>
                    </button>

                    <button
                      onClick={() => handleDownloadSVG(activeShareBadge)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs font-black uppercase tracking-wider text-white transition cursor-pointer shadow-md shadow-indigo-500/10"
                    >
                      <Award size={13} className="text-yellow-350" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: Live Feed Preview */}
                <div className="space-y-3.5 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-850/80 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-450">
                      Live Feed Mockup
                    </span>
                    {/* Switch layout platform selector */}
                    <div className="flex gap-1.5">
                      {["twitter", "linkedin"].map(plat => (
                        <button
                          key={plat}
                          onClick={() => setSharePlatform(plat)}
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition cursor-pointer ${
                            sharePlatform === plat
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-850 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render Twitter/X Post Mockup */}
                  {sharePlatform === "twitter" ? (
                    <div className="p-4 bg-black rounded-xl border border-slate-850/85 text-left text-white space-y-3 shadow-inner select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-400">
                          EV
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold hover:underline">Developer Achievement</span>
                            <span className="w-3 h-3 text-sky-400">✔️</span>
                          </div>
                          <p className="text-[10px] text-slate-500">@eventra_developer</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                        {shareStory || "Write something in the composer..."}
                      </p>
                      
                      {/* Attached Card Mockup */}
                      <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/70">
                        <div className="p-5 bg-gradient-to-br from-indigo-950/50 to-slate-950 text-center border-b border-slate-850">
                          <span className="inline-block p-3 rounded-2xl bg-indigo-900/30 border border-indigo-500/25 text-3xl mx-auto shadow-inner">
                            {activeShareBadge.icon}
                          </span>
                          <h4 className="text-sm font-extrabold text-white mt-3 tracking-tight">{activeShareBadge.name}</h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Verified Achieve Token</p>
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">eventra.dev</p>
                          <h5 className="text-[11px] font-extrabold text-slate-200 mt-0.5">Claimed Level {currentLevel} Attendee Badge!</h5>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">Register for meetups, unlock streak multipliers, and grow your XP.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Render LinkedIn Article Mockup */
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-850 text-left text-slate-800 dark:text-slate-200 space-y-3 shadow-inner select-none">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-650 dark:text-indigo-400">
                          EV
                        </div>
                        <div>
                          <h4 className="text-xs font-black hover:underline hover:text-blue-600">Eventra Developer</h4>
                          <p className="text-[9px] text-slate-500 leading-none mt-1">GSSoC Achiever • Event Progression Engine</p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                        {shareStory || "Write something in the composer..."}
                      </p>
                      
                      {/* Attached Article Mockup */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/80">
                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-950 text-center border-b border-slate-200 dark:border-slate-800">
                          <span className="inline-block p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-300/30 dark:border-indigo-500/25 text-3xl mx-auto shadow-inner">
                            {activeShareBadge.icon}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">{activeShareBadge.name}</h4>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-1">Achiever Token Certification</p>
                        </div>
                        <div className="p-3">
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-extrabold">EVENTRA.DEV</p>
                          <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Unlocked Badge Milestone on Eventra</h5>
                          <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-1">Developer successfully completed the &apos;{activeShareBadge.name}&apos; challenges.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom helper info */}
                  <div className="text-[9px] text-center text-slate-550 leading-snug">
                    ℹ️ Select Twitter or LinkedIn tab to preview the card layout. Make sure to complete your developer challenges to boost your XP level!
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ATTENDEE EVENT BADGE GENERATOR OVERLAY MODAL */}
      <AnimatePresence>
        {isBadgeModalOpen && (
          <EventBadgeGenerator
            onClose={() => setIsBadgeModalOpen(false)}
            userStats={{ totalEvents, currentStreak, unlockedCount }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
