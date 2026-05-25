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

// Countdown Hook
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
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

// Countdown Timer
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
      </div>
    </div>
  );
};

// Urgency Badge
const UrgencyBadge = ({ startDate, endDate, status }) => {
  const timeLeft = useCountdown(status === "upcoming" ? startDate : endDate);
  if (status === "completed" || !timeLeft) return null;

  if (timeLeft.days < 1) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
        🔥 Closing Today
      </span>
    );
  }
  if (timeLeft.days < 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
        ⚡ Closing Soon
      </span>
    );
  }
  return null;
};

const computeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < now) return "completed";
  if (start <= now && now <= end) return "live";
  return "upcoming";
};

const HackathonCard = ({ hackathon = {}, isFeatured = false, ...props }) => {
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
                Submit
              </button>
            </div>
          ) : status === "upcoming" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/register/${hackathon.id}`)}
                className="flex-1 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white text-xs font-bold rounded-lg transition-colors"
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
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default HackathonCard;