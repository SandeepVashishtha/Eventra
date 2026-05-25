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
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

import { addHackathonToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";

// ─── Countdown Hook ────────────────────────────────────────────────────────
const useCountdown = (targetDate) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return null;
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

// ─── Countdown Timer ───────────────────────────────────────────────────────
const CountdownTimer = ({ targetDate, label }) => {
  const timeLeft = useCountdown(targetDate);

  if (!timeLeft) {
    return (
      <span className="text-red-500 dark:text-red-400 font-semibold text-xs">
        Deadline passed
      </span>
    );
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

// ─── Urgency Badge ────────────────────────────────────────────────────────
const UrgencyBadge = ({ startDate, endDate, status }) => {
  const timeLeft = useCountdown(status === "upcoming" ? startDate : endDate);
  if (status === "completed" || !timeLeft) return null;

  if (timeLeft.days < 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border-red-200 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/40 border text-xs font-bold">
        🔥 Closing Today!
      </span>
    );
  }
  if (timeLeft.days < 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/40 border text-xs font-bold">
        ⚡ Closing Soon
      </span>
    );
  }
  return null;
};

// ─── Status helpers ───────────────────────────────────────────────────────
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

// ─── Main Card ─────────────────────────────────────────────────────────
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
    rules: Array.isArray(hackathon?.rules) && hackathon.rules.length > 0 ? hackathon.rules : ["Rules will be shared before the hackathon starts."],
    participants: hackathon?.participants ?? 0,
    teams: hackathon?.teams ?? 0,
    submissions: hackathon?.submissions ?? 0,
    winner: hackathon?.winner || "",
  };

  const status = computeStatus(normalizedHackathon.startDate, normalizedHackathon.endDate);
  const style = statusStyles[status];

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
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -5, scale: 1.015 }}
      className={`h-full relative flex flex-col rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_8px_40px_rgba(99,102,241,0.18)] hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 ${isFeatured ? "ring-2 ring-indigo-400/50 dark:ring-indigo-500/40" : ""}`}
      {...props}
    >
      {/* Gradient top border line */}
      <div className={`rounded-t-2xl h-[3px] w-full bg-gradient-to-r flex-shrink-0 ${style.topBar}`} />

      {/* Main Content */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Status + Featured badge + Share */}
        <div className="flex items-start justify-between gap-2">
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

          <ShareMenu shareData={hackathonSharingData} position="bottom-right" menuClassName="!z-[999] shadow-2xl">
            <motion.div
              className="flex-shrink-0 bg-slate-50 dark:bg-white/5 rounded-full p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ShareIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </motion.div>
          </ShareMenu>
        </div>

        {/* Featured badge */}
        {isFeatured && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-600/30 dark:to-violet-600/30 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              ✦ Featured
            </span>
          </div>
        )}

        {/* Prize chip */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full">
            🏆 {normalizedHackathon.prize}
          </span>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Title + Description */}
        <div className="min-h-[72px]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
            {normalizedHackathon.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
            {normalizedHackathon.description}
          </p>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Organizer */}
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
          <BuildingLibraryIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="truncate">{normalizedHackathon.organizer}</span>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Date & Location */}
        <div className="flex flex-col gap-2.5 text-slate-600 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            <span>
              {new Date(normalizedHackathon.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" – "}
              {new Date(normalizedHackathon.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{normalizedHackathon.location}</span>
          </div>
        </div>

        {/* Countdown Timers */}
        <div className="flex flex-col gap-2">
          {status === "upcoming" && normalizedHackathon.startDate && (
            <CountdownTimer targetDate={normalizedHackathon.startDate} label="Starts in" />
          )}
          {status === "live" && normalizedHackathon.endDate && (
            <CountdownTimer targetDate={normalizedHackathon.endDate} label="Ends in" />
          )}
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Tech Stack */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {normalizedHackathon.techStack.map((tech, index) => (
              <span key={index} className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300 text-xs font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Rules */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
            <DocumentTextIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            Rules
          </h4>
          <ul className="list-disc list-inside text-xs line-clamp-3 min-h-[60px] text-slate-600 dark:text-slate-400">
            {normalizedHackathon.rules.map((rule, index) => (
              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5" />

        {/* Stats Row */}
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

        {/* Winner */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 p-3 rounded-xl">
          <TrophyIcon className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Winner:</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
            {status === "completed" && normalizedHackathon.winner ? normalizedHackathon.winner : "Announced soon"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-3">
          {status === "live" ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                Join Now
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 text-sm font-semibold rounded-xl transition-all">
                Submit
              </button>
            </div>
          ) : status === "upcoming" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/register/${normalizedHackathon.id}`)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Register
              </button>
              <a
                href={addHackathonToGoogleCalendar(normalizedHackathon)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 text-sm font-medium rounded-xl text-center transition-all block"
              >
                Reminder
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                View Results
              </button>
              <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-700 shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 text-sm font-semibold rounded-xl transition-all">
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
