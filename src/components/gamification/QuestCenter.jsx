import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Zap, CheckCircle, Gift, Target,
  Flame, Star, Trophy, Sparkles, Timer,
} from 'lucide-react';

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

// Lightweight ascending polyphonic retro chime synthesizer using native Web Audio API
const playClaimSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Define pitch sequence for ascending chime (pentatonic scale feels very positive)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    
    notes.forEach((freq, idx) => {
      const triggerTime = now + idx * 0.08;
      
      // Oscillator 1: Sine (warm body)
      const osc1 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, triggerTime);
      
      // Pitch slide up slightly on each note for extra dynamic bounce
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.05, triggerTime + 0.12);
      
      // Exponential decay envelope
      gainNode.gain.setValueAtTime(0, triggerTime);
      gainNode.gain.linearRampToValueAtTime(0.2, triggerTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, triggerTime + 0.25);
      
      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(triggerTime);
      osc1.stop(triggerTime + 0.3);

      // Oscillator 2: Triangle (adds subtle retro weight)
      const osc2 = ctx.createOscillator();
      const gainNode2 = ctx.createGain();
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq, triggerTime);
      gainNode2.gain.setValueAtTime(0, triggerTime);
      gainNode2.gain.linearRampToValueAtTime(0.08, triggerTime + 0.02);
      gainNode2.gain.exponentialRampToValueAtTime(0.001, triggerTime + 0.2);
      
      osc2.connect(gainNode2);
      gainNode2.connect(ctx.destination);
      
      osc2.start(triggerTime);
      osc2.stop(triggerTime + 0.25);
    });

    // Close the audio context after all notes finish playing to prevent resource leakage
    setTimeout(() => {
      try {
        if (ctx.state !== "closed") {
          ctx.close();
        }
      } catch (err) {
        console.warn("Failed to close AudioContext:", err);
      }
    }, 1500);
  } catch (error) {
    console.warn("Web Audio API not allowed or supported on this context:", error);
  }
};

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

  // Persist to localStorage on every state change
  useEffect(() => { saveQuestState(state); }, [state]);

  // Derive demo progress from props (totalEvents, currentStreak)
  // 🔥 FIX 2: Added state.dailyResetAt and state.weeklyResetAt to dependency array.
  // This ensures that when the clock rolls over and the quests are wiped clean, 
  // this effect re-runs to correctly repopulate progress from the active props!
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
  }, [totalEvents, currentStreak, state.dailyResetAt, state.weeklyResetAt]);

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

  // ─── Claim handler ───────────────────────────────────────────────────────────
  const claimXP = (questId, xp, isWeekly) => {
    const claimedKey = isWeekly ? 'weeklyClaimed' : 'dailyClaimed';
    
    // 🔥 FIX 1: Moved the check INSIDE the functional setState.
    // Checking the closure 'state' allows spam-click double-claiming exploits.
    // Checking 'prev' guarantees atomic verification.
    setState(prev => {
      if (prev[claimedKey][questId]) return prev; // Already claimed, block exploit

      return {
        ...prev,
        [claimedKey]: { ...prev[claimedKey], [questId]: true },
        lifetimeXP: prev.lifetimeXP + xp,
      };
    });

    setClaimFlash(questId);
    fireConfetti(confettiRef);
    playClaimSound();
    toast.success(`Mission Completed! Claimed +${xp} XP! 🎉`, {
      icon: "🌟",
      autoClose: 3500,
    });
    setTimeout(() => setClaimFlash(null), 1200);
  };

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
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
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

  return (
    <section className="space-y-6" ref={confettiRef} style={{ position: 'relative' }}>
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
            <Target className="w-3.5 h-3.5" /> Quest Center
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 mt-1">
            Daily & Weekly Missions
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-lg">
            Complete missions to earn XP, climb levels, and unlock exclusive developer tokens. Quests refresh automatically.
          </p>
        </div>

        {/* Lifetime XP badge */}
        <div className="flex items-center gap-3">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/40 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quest XP Earned</p>
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{state.lifetimeXP}</p>
            </div>
          </div>
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
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all
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
    </section>
  );
}