import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, BrainCircuit, Moon } from "lucide-react";
import { motion } from "framer-motion";

const MODES = {
  FOCUS: {
    label: "Focus",
    minutes: 25,
    color: "text-indigo-400",
    bg: "bg-indigo-600",
    icon: BrainCircuit,
  },
  SHORT_BREAK: {
    label: "Short Break",
    minutes: 5,
    color: "text-emerald-400",
    bg: "bg-emerald-600",
    icon: Coffee,
  },
  LONG_BREAK: {
    label: "Long Break",
    minutes: 15,
    color: "text-purple-400",
    bg: "bg-purple-600",
    icon: Moon,
  },
};

const usePomodoroStorage = ({ mode, timeLeft, isActive, setMode, setTimeLeft, setIsActive }) => {
  // Load state from local storage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("pomodoroState");
      if (!savedState) return;

      const { savedMode, savedTimeLeft, savedTimestamp, savedIsActive } = JSON.parse(savedState);

      // Ensure the saved mode still exists
      if (!MODES[savedMode]) return;

      setMode(savedMode);

      if (savedIsActive) {
        const elapsedSeconds = Math.floor((Date.now() - savedTimestamp) / 1000);
        const newTimeLeft = Math.max(0, savedTimeLeft - elapsedSeconds);
        setTimeLeft(newTimeLeft);
        setIsActive(newTimeLeft > 0);
      } else {
        setTimeLeft(savedTimeLeft);
        setIsActive(false);
      }
    } catch (err) {
      console.error("Failed to parse pomodoro state:", err);
    }
  }, [setMode, setTimeLeft, setIsActive]);

  // Save state to local storage whenever critical state changes
  useEffect(() => {
    const stateToSave = {
      savedMode: mode,
      savedTimeLeft: timeLeft,
      savedTimestamp: Date.now(),
      savedIsActive: isActive,
    };
    localStorage.setItem("pomodoroState", JSON.stringify(stateToSave));
  }, [mode, timeLeft, isActive]);
};

const usePomodoroInterval = ({ isActive, timeLeft, setTimeLeft, setIsActive }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft, setTimeLeft, setIsActive]);
};

const usePomodoroLogic = () => {
  const [mode, setMode] = useState("FOCUS");
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.minutes * 60);
  const [isActive, setIsActive] = useState(false);

  usePomodoroStorage({ mode, timeLeft, isActive, setMode, setTimeLeft, setIsActive });
  usePomodoroInterval({ isActive, timeLeft, setTimeLeft, setIsActive });

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const switchMode = (newMode) => {
    if (mode === newMode) return;
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  return { mode, timeLeft, isActive, toggleTimer, resetTimer, switchMode };
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const PomodoroTimer = () => {
  const { mode, timeLeft, isActive, toggleTimer, resetTimer, switchMode } = usePomodoroLogic();

  const totalTime = MODES[mode].minutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const currentMode = MODES[mode];
  const CurrentIcon = currentMode.icon;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Progress animation: dashoffset goes from circumference (0%) to 0 (100%)
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-extrabold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <CurrentIcon size={16} className={currentMode.color} />
          <span>Focus Timer</span>
        </h3>
      </div>

      {/* Mode selectors with Framer Motion layout animation */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 relative">
        {Object.entries(MODES).map(([key, config]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`relative flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors z-10 ${
              mode === key ? "text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {mode === key && (
              <motion.div
                layoutId="pomodoro-active-tab"
                className="absolute inset-0 bg-slate-800 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
            <span className="relative z-20">{config.label}</span>
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center mb-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track */}
            <circle
              className="text-slate-800/50 stroke-current"
              strokeWidth="4"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            />
            {/* Progress indicator */}
            <motion.circle
              className={`${currentMode.color} stroke-current`}
              strokeWidth="4"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ strokeDasharray: circumference }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tracking-tighter text-white tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-auto">
        <button
          onClick={toggleTimer}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg cursor-pointer ${
            isActive
              ? "bg-slate-800 text-white hover:bg-slate-700 shadow-none"
              : `${currentMode.bg} text-white hover:opacity-90 shadow-indigo-500/20`
          }`}
          aria-label={isActive ? "Pause Timer" : "Start Timer"}
        >
          {isActive ? (
            <Pause size={24} className="fill-current" />
          ) : (
            <Play size={24} className="fill-current ml-1" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
          aria-label="Reset Timer"
          title="Reset Timer"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
