import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Clock, CheckCircle, Lock, Gift, Target,
  Flame, Star, ChevronDown, Trophy, Sparkles, Timer,
  Volume2, VolumeX,
} from 'lucide-react';
import LevelProgressRing from '../ui/LevelProgressRing';

// ─── localStorage helpers ──────────────────────────────────────────────────────
const QUEST_STORAGE_KEY = 'eventra_quest_state';

function loadQuestState() {
  try {
    const raw = localStorage.getItem(QUEST_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveQuestState(state) {
  try { localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

// ─── Time utilities ────────────────────────────────────────────────────────────
function getNextDailyReset() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

function getNextWeeklyReset() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const daysUntilMon = day === 0 ? 1 : 8 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMon);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function formatCountdown(ms) {
  if (ms <= 0) return '0h 0m';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

// ─── Procedural Audio Synthesizer (Web Audio API) ─────────────────────────────
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playChimeSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    // Ascent chime: E5 (659.25Hz) to G5 (783.99Hz)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.error("Failed to play procedural chime sound:", e);
  }
}

function playLevelUpSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Brassy triumphant horn chord progression: C4 (261.63Hz), E4 (329.63Hz), G4 (392.00Hz), C5 (523.25Hz)
    const chord = [261.63, 329.63, 392.00, 523.25];
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      
      gain.gain.setValueAtTime(0, now + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.06 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);
      
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.6);
    });
  } catch (e) {
    console.error("Failed to play procedural level up sound:", e);
  }
}

// ─── Default quest definitions ─────────────────────────────────────────────────
const DAILY_QUESTS = [
  { id: 'dq-1', title: 'Join 1 Workshop', description: 'Register for any workshop or webinar today.', icon: '📚', targetProgress: 1, rewardXP: 75 },
  { id: 'dq-2', title: 'Visit Your Profile', description: 'Navigate to your profile page and review your stats.', icon: '👤', targetProgress: 1, rewardXP: 25 },
  { id: 'dq-3', title: 'Explore Events Page', description: 'Browse the events listing and discover new opportunities.', icon: '🔍', targetProgress: 1, rewardXP: 50 },
];

const WEEKLY_QUESTS = [
  { id: 'wq-1', title: 'Register for 2 GSSoC Events', description: 'Join two GSSoC-specialised events this week.', icon: '💻', targetProgress: 2, rewardXP: 200 },
  { id: 'wq-2', title: 'Maintain a 3-Day Streak', description: 'Log in and interact on 3 separate days.', icon: '🔥', targetProgress: 3, rewardXP: 300 },
  { id: 'wq-3', title: 'Complete Profile Card', description: 'Fill out all profile fields to 100% completion.', icon: '🎯', targetProgress: 1, rewardXP: 150 },
  { id: 'wq-4', title: 'Attend 5 Community Meetups', description: 'Register and attend five platform events.', icon: '🤝', targetProgress: 5, rewardXP: 400 },
];

// ─── Confetti burst (lightweight, no dependency) ───────────────────────────────
function fireConfetti(containerRef) {
  if (!containerRef.current) return;
  const container = containerRef.current;
  const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e'];
  for (let i = 0; i < 40; i++) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      position:absolute;left:${Math.random()*100}%;top:40%;
      width:${4+Math.random()*6}px;height:${4+Math.random()*6}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      pointer-events:none;z-index:100;opacity:1;
    `;
    container.appendChild(dot);
    const dx = (Math.random() - 0.5) * 260;
    const dy = -(60 + Math.random() * 180);
    const rot = Math.random() * 720;
    dot.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg)`, opacity: 0 },
    ], { duration: 800 + Math.random() * 500, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'forwards' });
    setTimeout(() => dot.remove(), 1400);
  }
}

// ─── Main QuestCenter component ────────────────────────────────────────────────
export default function QuestCenter({ totalEvents = 0, currentStreak = 0 }) {
  const confettiRef = useRef(null);
  const [activeTab, setActiveTab] = useState('daily');

  // Initialise quest progress from localStorage or fresh defaults
  const initState = useCallback(() => {
    const saved = loadQuestState();
    const now = Date.now();

    // Check whether saved state is stale
    if (saved) {
      const dailyExpired = now >= saved.dailyResetAt;
      const weeklyExpired = now >= saved.weeklyResetAt;

      return {
        dailyProgress: dailyExpired ? {} : (saved.dailyProgress || {}),
        dailyClaimed: dailyExpired ? {} : (saved.dailyClaimed || {}),
        weeklyProgress: weeklyExpired ? {} : (saved.weeklyProgress || {}),
        weeklyClaimed: weeklyExpired ? {} : (saved.weeklyClaimed || {}),
        dailyResetAt: dailyExpired ? getNextDailyReset() : saved.dailyResetAt,
        weeklyResetAt: weeklyExpired ? getNextWeeklyReset() : saved.weeklyResetAt,
        lifetimeXP: saved.lifetimeXP || 0,
      };
    }

    return {
      dailyProgress: {},
      dailyClaimed: {},
      weeklyProgress: {},
      weeklyClaimed: {},
      dailyResetAt: getNextDailyReset(),
      weeklyResetAt: getNextWeeklyReset(),
      lifetimeXP: 0,
    };
  }, []);

  const [state, setState] = useState(initState);
  const [claimFlash, setClaimFlash] = useState(null);
  const [dailyCountdown, setDailyCountdown] = useState('');
  const [weeklyCountdown, setWeeklyCountdown] = useState('');

  // Audio configuration state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('eventra_sound_enabled') !== 'false';
  });

  // Gamification overlay and shake triggers
  const [isShaking, setIsShaking] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(null);

  // Persist to localStorage on every state change
  useEffect(() => { saveQuestState(state); }, [state]);

  // Derive demo progress from props (totalEvents, currentStreak)
  useEffect(() => {
    setState(prev => {
      const dp = { ...prev.dailyProgress };
      const wp = { ...prev.weeklyProgress };
      // Auto-fill progress based on live achievement data
      if (totalEvents >= 1) dp['dq-1'] = Math.min(1, totalEvents);
      dp['dq-2'] = 1; // visiting profile = auto-complete demo
      dp['dq-3'] = 1; // exploring events = auto-complete demo
      wp['wq-1'] = Math.min(2, totalEvents);
      wp['wq-2'] = Math.min(3, currentStreak);
      wp['wq-4'] = Math.min(5, totalEvents);
      return { ...prev, dailyProgress: dp, weeklyProgress: wp };
    });
  }, [totalEvents, currentStreak]);

  // Countdown timer
  useEffect(() => {
    function tick() {
      const now = Date.now();
      setDailyCountdown(formatCountdown(state.dailyResetAt - now));
      setWeeklyCountdown(formatCountdown(state.weeklyResetAt - now));

      // If a reset boundary has passed, reinitialise
      if (now >= state.dailyResetAt || now >= state.weeklyResetAt) {
        setState(initState());
      }
    }
    tick();
    const id = setInterval(tick, 30000); // update every 30s
    return () => clearInterval(id);
  }, [state.dailyResetAt, state.weeklyResetAt, initState]);

  // Sound settings toggler
  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('eventra_sound_enabled', String(next));
      return next;
    });
  };

  // ─── Claim handler ───────────────────────────────────────────────────────────
  const claimXP = (questId, xp, isWeekly) => {
    const claimedKey = isWeekly ? 'weeklyClaimed' : 'dailyClaimed';
    if (state[claimedKey][questId]) return; // already claimed

    const XP_PER_LEVEL = 100;
    const currentLevelBefore = Math.floor(state.lifetimeXP / XP_PER_LEVEL) + 1;
    const currentLevelAfter = Math.floor((state.lifetimeXP + xp) / XP_PER_LEVEL) + 1;

    setState(prev => ({
      ...prev,
      [claimedKey]: { ...prev[claimedKey], [questId]: true },
      lifetimeXP: prev.lifetimeXP + xp,
    }));

    setClaimFlash(questId);
    fireConfetti(confettiRef);

    // Screen-shake micro-animation
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    // Check level-up boundary crossing
    if (currentLevelAfter > currentLevelBefore) {
      setIsLevelingUp(currentLevelAfter);
      if (soundEnabled) {
        playLevelUpSound();
      }
      // Burst celebratory confetti waves
      setTimeout(() => fireConfetti(confettiRef), 150);
      setTimeout(() => fireConfetti(confettiRef), 350);
      setTimeout(() => fireConfetti(confettiRef), 550);
    } else {
      if (soundEnabled) {
        playChimeSound();
      }
    }

    setTimeout(() => setClaimFlash(null), 1200);
  };

  // Calculate current level and XP ratios
  const XP_PER_LEVEL = 100;
  const currentLevel = Math.floor(state.lifetimeXP / XP_PER_LEVEL) + 1;
  const currentXP = state.lifetimeXP % XP_PER_LEVEL;
  const percentage = (currentXP / XP_PER_LEVEL) * 100;

  // ─── Quest card renderer ─────────────────────────────────────────────────────
  const renderQuest = (quest, isWeekly) => {
    const progressMap = isWeekly ? state.weeklyProgress : state.dailyProgress;
    const claimedMap = isWeekly ? state.weeklyClaimed : state.dailyClaimed;
    const current = Math.min(progressMap[quest.id] || 0, quest.targetProgress);
    const pct = Math.round((current / quest.targetProgress) * 100);
    const isComplete = current >= quest.targetProgress;
    const isClaimed = claimedMap[quest.id];

    return (
      <motion.div
        key={quest.id}
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ y: -3 }}
        className={`
          relative p-5 rounded-2xl border backdrop-blur-xl overflow-hidden cursor-default
          transition-all duration-300
          ${isClaimed
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30'
            : isComplete
              ? 'bg-amber-50/40 dark:bg-amber-950/15 border-amber-300/50 dark:border-amber-700/30 shadow-[0_0_24px_rgba(245,158,11,0.08)]'
              : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/40 hover:shadow-lg hover:border-indigo-200 dark:hover:border-slate-700'
          }
        `}
      >
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <span className={`text-2xl p-2 rounded-xl shrink-0 ${isClaimed ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-slate-100 dark:bg-slate-800/60'}`}>
            {quest.icon}
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <Zap className="w-3 h-3" /> +{quest.rewardXP} XP
            </span>
            {isClaimed && (
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Claimed
              </span>
            )}
          </div>
        </div>

        {/* title + desc */}
        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-3 tracking-tight">
          {quest.title}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
          {quest.description}
        </p>

        {/* progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Progress</span>
            <span>{current} / {quest.targetProgress}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                isClaimed
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : isComplete
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                    : 'bg-gradient-to-r from-indigo-500 to-violet-500'
              }`}
            />
          </div>
        </div>

        {/* Claim button */}
        {isComplete && !isClaimed && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => claimXP(quest.id, quest.rewardXP, isWeekly)}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            Claim {quest.rewardXP} XP
          </motion.button>
        )}

        {/* Claim flash overlay */}
        <AnimatePresence>
          {claimFlash === quest.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/10 rounded-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  const quests = activeTab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;
  const countdown = activeTab === 'daily' ? dailyCountdown : weeklyCountdown;
  const totalAvailableXP = quests.reduce((s, q) => s + q.rewardXP, 0);
  const claimedMap = activeTab === 'daily' ? state.dailyClaimed : state.weeklyClaimed;
  const claimedXP = quests.filter(q => claimedMap[q.id]).reduce((s, q) => s + q.rewardXP, 0);

  // Framer Motion keyframe screen-shake animation
  const shakeVariants = {
    shake: {
      x: [0, -6, 6, -6, 6, -3, 3, -1, 1, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    idle: { x: 0 }
  };

  return (
    <motion.section
      className="space-y-6"
      ref={confettiRef}
      style={{ position: 'relative' }}
      animate={isShaking ? "shake" : "idle"}
      variants={shakeVariants}
    >
      {/* Section HUD Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <Target className="w-3.5 h-3.5" /> Quest Center
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            Daily & Weekly Missions
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-lg">
            Complete missions to earn XP, climb levels, and unlock exclusive developer tokens. Quests refresh automatically.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {/* Lifetime XP badge */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm select-none">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quest XP Earned</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{state.lifetimeXP}</p>
              </div>
            </div>

            {/* Audio Toggle switch */}
            <button
              type="button"
              onClick={toggleSound}
              className="p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm hover:scale-105 transition-all text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              title={soundEnabled ? "Mute quest sounds" : "Unmute quest sounds"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="md:col-span-1">
          <LevelProgressRing
            level={currentLevel}
            currentXP={currentXP}
            percentage={percentage}
          />
        </div>
      </div>

      {/* Tabs + Timer row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: 'daily', label: 'Daily Missions', icon: <Flame className="w-3.5 h-3.5" /> },
            { id: 'weekly', label: 'Weekly Challenges', icon: <Trophy className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer
                ${activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-white/60 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Countdown timer */}
        <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-xl px-4 py-2.5 shadow-sm">
          <Timer className="w-4 h-4 text-rose-500 animate-pulse" />
          <div>
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none">Refreshes in</p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight mt-0.5" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {countdown}
            </p>
          </div>
        </div>
      </div>

      {/* XP summary bar */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
            {claimedXP} / {totalAvailableXP} XP claimed from {activeTab} quests
          </span>
        </div>
        <div className="w-full sm:w-48 h-2 rounded-full bg-slate-200/50 dark:bg-slate-800/40 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: totalAvailableXP > 0 ? `${(claimedXP / totalAvailableXP) * 100}%` : '0%' }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>
      </div>

      {/* Quest grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {quests.map(q => renderQuest(q, activeTab === 'weekly'))}
        </AnimatePresence>
      </div>

      {/* Level Up Celebration Modal Overlay */}
      <AnimatePresence>
        {isLevelingUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLevelingUp(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative bg-gradient-to-br from-slate-900 to-indigo-950/90 border-2 border-indigo-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden z-10 select-none"
            >
              {/* Outer glowing ring decorative backdrop */}
              <div className="absolute -top-16 -left-16 w-36 h-36 bg-fuchsia-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl" />
              
              {/* Spinning star sparkles overlay */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 mx-auto bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/30"
              >
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                </div>
              </motion.div>
              
              <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-widest mt-6">
                Achievement unlocked
              </h3>
              
              <h2 className="text-4xl font-extrabold text-white tracking-tighter mt-1 filter drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                LEVEL UP!
              </h2>
              
              <p className="text-sm font-semibold text-slate-300 mt-3">
                You have advanced to <span className="font-extrabold text-indigo-400">Level {isLevelingUp}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Congratulations. Keep completing missions to earn exclusive community tokens and progress badges.
              </p>
              
              <button
                type="button"
                onClick={() => setIsLevelingUp(null)}
                className="mt-8 px-8 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-103 active:scale-97 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer w-full flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Claim Rewards
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
