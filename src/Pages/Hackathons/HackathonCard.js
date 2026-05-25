import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

import { addHackathonToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";

// ─── Countdown Hook ───────────────────────────────────────────────────────────
const useCountdown = (targetDate) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return null;
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

// ─── Countdown Timer ──────────────────────────────────────────────────────────
const CountdownTimer = ({ targetDate, label }) => {
  const timeLeft = useCountdown(targetDate);

  if (!timeLeft) {
    return (
      <span className="text-red-500 font-semibold text-xs tracking-wide">
        Deadline passed
      </span>
    );
  }

  const isUrgent = timeLeft.days < 3;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${
        isUrgent
          ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400"
          : "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400"
      }`}
    >
      <ClockIcon className={`w-3.5 h-3.5 shrink-0 ${isUrgent ? "animate-pulse" : ""}`} />
      <span className="text-[11px] font-medium opacity-80">{label}:</span>
      <div className="flex items-center gap-0.5 font-mono text-[11px] font-bold">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, "0")}h</span>
        <span>{String(timeLeft.minutes).padStart(2, "0")}m</span>
    return <span className="text-red-500 dark:text-red-400 font-semibold text-xs">Deadline passed</span>;
  }

  const isUrgent = timeLeft.days < 3;
  const isVerySoon = timeLeft.days === 0;
  const chipClass = isUrgent
    ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 border"
    : "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 border";

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? "text-red-500 dark:text-red-400" : "text-indigo-600 dark:text-indigo-400"}`}>
      <ClockIcon className={`w-4 h-4 flex-shrink-0 ${isUrgent ? "animate-pulse" : ""}`} />
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}:</span>
      <div className="flex items-center gap-1 font-mono text-xs font-bold">
        {timeLeft.days > 0 && (
          <span className={`px-1.5 py-0.5 rounded ${chipClass}`}>{timeLeft.days}d</span>
        )}
        <span className={`px-1.5 py-0.5 rounded ${chipClass}`}>
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>
        <span className={`px-1.5 py-0.5 rounded ${chipClass}`}>
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>
        {isVerySoon && (
          <span className="px-1.5 py-0.5 rounded bg-red-50 border-red-200 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 border">
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Urgency Badge ────────────────────────────────────────────────────────────
const UrgencyBadge = ({ startDate, endDate, status }) => {
  const timeLeft = useCountdown(status === "upcoming" ? startDate : endDate);
  if (status === "completed" || !timeLeft) return null;

  if (timeLeft.days < 1) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
        🔥 Closing Today
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border-red-200 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 border text-xs font-bold animate-pulse">
        🔥 Closing Today!
      </span>
    );
  }
  if (timeLeft.days < 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40 border text-xs font-bold">
        ⚡ Closing Soon
      </span>
    );
  }
  return null;
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const computeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < now) return "completed";
  if (start <= now && now <= end) return "live";
  return "upcoming";
};

const statusStyles = {
  live: {
    badge: "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 border",
    dot: "bg-red-500 animate-pulse",
    topBar: "from-red-500 via-orange-500 to-red-500",
  },
  upcoming: {
    badge: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/40 border",
    dot: "bg-blue-500",
    topBar: "from-blue-500 via-indigo-500 to-violet-500",
  },
  completed: {
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 border",
    dot: "bg-emerald-500",
    topBar: "from-emerald-500 via-teal-500 to-emerald-500",
  },
};

// ─── Main Card ────────────────────────────────────────────────────────────────
const HackathonCard = ({ hackathon, isFeatured = false, ...props }) => {
  const navigate = useNavigate();
  const normalizedHackathon = {
    ...hackathon,
    title: hackathon?.title || "Untitled Hackathon",
    description: hackathon?.description || "More details will be announced soon.",
    difficulty: hackathon?.difficulty || "Open",
    organizer: hackathon?.organizer || "Eventra Community",
    location: hackathon?.location || "Location TBA",
    prize: hackathon?.prize || "Prize TBA",
    techStack: Array.isArray(hackathon?.techStack) && hackathon.techStack.length > 0 ? hackathon.techStack : ["General"],
    participants: hackathon?.participants ?? 0,
    teams: hackathon?.teams ?? 0,
    submissions: hackathon?.submissions ?? 0,
    winner: hackathon?.winner || "",
  };

  const status = computeStatus(normalizedHackathon.startDate, normalizedHackathon.endDate);
    techStack:
      Array.isArray(hackathon?.techStack) && hackathon.techStack.length > 0
        ? hackathon.techStack
        : ["General"],
    rules:
      Array.isArray(hackathon?.rules) && hackathon.rules.length > 0
        ? hackathon.rules
        : ["Rules will be shared before the hackathon starts."],
  };

  // FIX 3: Use computed status everywhere instead of hackathon.status

  const status = computeStatus(hackathon.startDate, hackathon.endDate);
  const style = statusStyles[status];
  const safeTechStack = hackathon?.techStack || [];
  const safeRules = hackathon?.rules || [];
  
  const stats = {
    participants: normalizedHackathon.participants,
    teams: normalizedHackathon.teams,
    submissions: normalizedHackathon.submissions,
  };

  const hackathonSharingData = generateEventSharingData({
    ...normalizedHackathon,
    title: normalizedHackathon.title,
    description: normalizedHackathon.description,
    date: normalizedHackathon.startDate,
    id: normalizedHackathon.id,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true, amount: 0.1 }}
      whileHover={{ y: -4 }}
      className={`
        w-full max-w-sm h-full
        bg-white dark:bg-gray-900
        rounded-xl shadow-sm hover:shadow-md
        transition-all duration-200
        border border-gray-200/80 dark:border-gray-800
        relative flex flex-col overflow-hidden
        ${isFeatured ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
      `}
      {...props}
    >
      {/* Structural Accent Top line */}
      <div className={`h-1 w-full ${
        status === 'live' ? 'bg-red-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-emerald-500'
      }`} />

      {/* Main Container */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        
        {/* Top Badges Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              status === "live" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" :
              status === "upcoming" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
              "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            }`}>
              {status}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              {normalizedHackathon.difficulty}
            </span>
            <UrgencyBadge startDate={normalizedHackathon.startDate} endDate={normalizedHackathon.endDate} status={status} />
          </div>

          <ShareMenu shareData={hackathonSharingData} position="bottom-right">
            <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ShareIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          </ShareMenu>
        </div>

        {/* Title & Creator Core Space */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-0.5">
            {normalizedHackathon.title}
          </h3>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs gap-1">
            <BuildingLibraryIcon className="w-3.5 h-3.5 shrink-0 text-gray-400" />
            <span className="truncate font-medium">{normalizedHackathon.organizer}</span>
          </div>
        </div>

        {/* Primary High-Priority Data Split View Block */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Prize Pool</div>
            <div className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
              {normalizedHackathon.prize}
            </div>

      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -5, scale: 1.015 }}
      className={`
        h-full relative flex flex-col
        rounded-2xl
        border border-slate-200 dark:border-white/10
        bg-white dark:bg-slate-900
        shadow-sm hover:shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]
        dark:hover:shadow-[0_8px_40px_rgba(99,102,241,0.18)]
        hover:border-indigo-300 dark:hover:border-indigo-500/30
        transition-all duration-300
        ${isFeatured ? "ring-2 ring-indigo-400/50 dark:ring-indigo-500/40" : ""}
      `}
      {...props}
    >
      {/* ── Gradient top border line (no overflow-hidden needed) ── */}
      <div
        className={`rounded-t-2xl h-[3px] w-full bg-gradient-to-r flex-shrink-0 ${style.topBar}`}
      />

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* ── ROW 1: Status + Featured badge + Share ── */}
        <div className="flex items-start justify-between gap-2">
          {/* Left: status badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-medium">
              {normalizedHackathon.difficulty}
            </span>

            <UrgencyBadge startDate={normalizedHackathon.startDate} endDate={normalizedHackathon.endDate} status={status} />
          </div>

          {/* Right: Share button only */}
          <ShareMenu
            shareData={hackathonSharingData}
            position="bottom-right"
            menuClassName="!z-[999] shadow-2xl"
          >
            <motion.div
              className="flex-shrink-0 bg-slate-50 dark:bg-white/5 rounded-full p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ShareIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </motion.div>
          </ShareMenu>
        </div>

        {/* ── ROW 2: Featured badge (full-width, only shown if featured) ── */}
        {isFeatured && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-600/30 dark:to-violet-600/30 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
              ✦ Featured
            </span>
          </div>
        )}

        {/* ── ROW 3: Prize chip ── */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full">
            🏆 {normalizedHackathon.prize}
          </span>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Title + Description ── */}
        <div className="min-h-[72px]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
            {normalizedHackathon.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {normalizedHackathon.description}
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Organizer ── */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <BuildingLibraryIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="truncate">{normalizedHackathon.organizer}</span>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Date, Location, Countdown ── */}
        <div className="flex flex-col gap-2.5 text-slate-600 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            <span>
              {new Date(normalizedHackathon.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {" – "}
              {new Date(normalizedHackathon.endDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="border-l border-gray-200 dark:border-gray-700 pl-3">
            <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Format</div>
            <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-gray-200">
              <MapPinIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{normalizedHackathon.location}</span>
            </div>
          </div>
        </div>

        {/* Description Text */}
        <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
          {normalizedHackathon.description}
        </p>

        {/* Timeline Row Group */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              {new Date(hackathon.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" - "}
              {new Date(hackathon.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {status === "upcoming" && hackathon.startDate && (
            <CountdownTimer targetDate={hackathon.startDate} label="Starts in" />
          )}
          {status === "live" && hackathon.endDate && (
            <CountdownTimer targetDate={hackathon.endDate} label="Ends in" />
          )}
        </div>

        {/* Minimal Stack Badge Tags */}
        <div className="flex flex-wrap gap-1">
          {(hackathon.techStack || []).slice(0, 3).map((tech, index) => (
            <span key={index} className="px-2 py-0.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded">
              {tech}
            </span>
          ))}
          {(hackathon.techStack || []).length > 3 && (
            <span className="px-1.5 py-0.5 text-gray-400 text-[10px] font-medium">
              +{hackathon.techStack.length - 3}
            </span>
          )}
        </div>

        {/* Engagement Stats Stripe */}
        <div className="flex items-center justify-between py-2 px-1 bg-gray-50/40 dark:bg-gray-800/20 rounded-md border border-gray-100/40 dark:border-gray-800/30 text-center">
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{normalizedHackathon.participants || "0"}</div>
            <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Joiners</div>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{normalizedHackathon.teams || "0"}</div>
            <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Teams</div>
          </div>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{normalizedHackathon.submissions || "0"}</div>
            <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Builds</div>
          </div>
        </div>

        {/* Completed Winner Banner */}
        {status === "completed" && (
          <div className="flex items-center gap-1.5 bg-amber-50/40 dark:bg-amber-950/10 px-2.5 py-1.5 rounded-lg border border-amber-100/50 dark:border-amber-900/30 text-xs">
            <TrophyIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-bold text-amber-800 dark:text-amber-400">Winner:</span>
            <span className="text-gray-600 dark:text-gray-300 truncate font-medium">{normalizedHackathon.winner || "TBA"}</span>
          </div>
        )}

        {/* Smart Button/Action Area */}
        <div className="mt-auto pt-1">
          {status === "live" ? (
            <div className="flex items-center gap-2">
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                Join Now
              </button>
              <button className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <span>{normalizedHackathon.location}</span>
          </div>

          {status === "upcoming" && normalizedHackathon.startDate && (
            <CountdownTimer targetDate={normalizedHackathon.startDate} label="Starts in" />
          )}
          {status === "live" && normalizedHackathon.endDate && (
            <CountdownTimer targetDate={normalizedHackathon.endDate} label="Ends in" />
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Tech Stack ── */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Tech Stack
          </h4>

          <div className="flex flex-wrap gap-2">

            {safeTechStack.map((tech, index) => (
              <span
                key={index}
                className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Rules ── */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
            <DocumentTextIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            Rules
          </h4>

          <ul className="list-disc list-inside text-xs line-clamp-3 min-h-[60px]">
          
            {safeRules.map((rule, index) => (

              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 border border-slate-100 dark:bg-white/5 dark:border-white/10 p-3">
          {[
            { icon: UserGroupIcon, value: stats.participants, label: "Participants", color: "text-rose-500 dark:text-rose-400" },
            { icon: UserGroupIcon, value: stats.teams, label: "Teams", color: "text-emerald-500 dark:text-emerald-400" },
            { icon: UserGroupIcon, value: stats.submissions, label: "Submissions", color: "text-blue-600 dark:text-blue-400" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
              <div className={`text-base font-bold ${color}`}>{value || "–"}</div>
              <div className="text-[10px] text-slate-500 font-medium">{label}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* ── Winner ── */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 p-3 rounded-xl">
          <TrophyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Winner:</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
            {status === "completed" && normalizedHackathon.winner ? normalizedHackathon.winner : "Announced soon"}
          </span>
        </div>

        {/* ── Action Buttons ── */}
        <div className="mt-auto pt-1">
          {status === "live" ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg dark:shadow-[0_0_16px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all">
                Join Now
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-300 dark:hover:text-white dark:shadow-none text-sm font-semibold rounded-xl transition-all">
              Submit
              </button>
            </div>
          ) : status === "upcoming" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/register/${hackathon.id}`)}
                className="flex-1 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white text-xs font-bold rounded-lg transition-colors"
                onClick={() => navigate(`/register/${normalizedHackathon.id}`)}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg dark:shadow-[0_0_16px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-all"
              >
                Register
              </button>
              <a
                href={addHackathonToGoogleCalendar(normalizedHackathon)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Remind Me
              </a>
            </div>
          ) : (
            <button className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors">
              View Results
            </button>
                className="block"
              >
                <button className="w-full px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-300 dark:hover:text-white dark:shadow-none text-sm font-semibold rounded-xl transition-all">
                  Reminder
                </button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg dark:shadow-[0_0_16px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-all">
                View Results
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-slate-300 dark:hover:text-white dark:shadow-none text-sm font-semibold rounded-xl transition-all">
                Resources
              </button>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default HackathonCard;