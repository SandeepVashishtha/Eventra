import { motion } from "framer-motion";
import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  BuildingLibraryIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

import ShareMenu from "../../components/common/ShareMenu";
import { addHackathonToGoogleCalendar } from "../../utils/calendarUtils";
import { generateEventSharingData } from "../../utils/shareUtils";

const useCountdown = (targetDate) => {
  useReducedMotion();
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date();

    if (!targetDate || difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
    };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

const CountdownTimer = ({ targetDate, label }) => {
  const timeLeft = useCountdown(targetDate);

  if (!timeLeft) {
    return (
      <span className="text-xs font-semibold text-red-500 dark:text-red-400">Deadline passed</span>
    );
  }

  const isUrgent = timeLeft.days < 3;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isUrgent
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          : "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
      }`}
    >
      <ClockIcon className={`h-3.5 w-3.5 ${isUrgent ? "animate-pulse" : ""}`} />
      <span>{label}</span>
      <span className="font-mono">
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {String(timeLeft.hours).padStart(2, "0")}h {String(timeLeft.minutes).padStart(2, "0")}m
      </span>
    </div>
  );
};

const UrgencyBadge = ({ startDate, endDate, status }) => {
  const timeLeft = useCountdown(status === "upcoming" ? startDate : endDate);

  if (status === "completed" || !timeLeft || timeLeft.days >= 3) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        timeLeft.days < 1
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400"
          : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-400"
      }`}
    >
      {timeLeft.days < 1 ? "Closing today" : "Closing soon"}
    </span>
  );
};

const computeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < now) {
    return "completed";
  }

  if (start <= now && now <= end) {
    return "live";
  }

  return "upcoming";
};

const statusStyles = {
  live: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500 animate-pulse",
    topBar: "from-red-500 via-orange-500 to-red-500",
  },
  upcoming: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-500",
    topBar: "from-blue-500 via-indigo-500 to-violet-500",
  },
  completed: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-500",
    topBar: "from-emerald-500 via-teal-500 to-emerald-500",
  },
};

const formatDateRange = (startDate, endDate) => {
  const dateOptions = { month: "short", day: "numeric" };
  const start = new Date(startDate).toLocaleDateString("en-US", dateOptions);
  const end = new Date(endDate).toLocaleDateString("en-US", {
    ...dateOptions,
    year: "numeric",
  });

  return `${start} - ${end}`;
};

const HackathonCard = ({ hackathon, isFeatured = false, ...props }) => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const normalizedHackathon = {
    ...hackathon,
    title: hackathon?.title || "Untitled Hackathon",
    description: hackathon?.description || "More details will be announced soon.",
    difficulty: hackathon?.difficulty || "Open",
    organizer: hackathon?.organizer || "Eventra Community",
    location: hackathon?.location || "Location TBA",
    prize: hackathon?.prize || "Prize TBA",
    techStack:
      Array.isArray(hackathon?.techStack) && hackathon.techStack.length > 0
        ? hackathon.techStack
        : ["General"],
    participants: hackathon?.participants ?? 0,
    teams: hackathon?.teams ?? 0,
    submissions: hackathon?.submissions ?? 0,
    winner: hackathon?.winner || "",
  };

  const status =
    normalizedHackathon.startDate && normalizedHackathon.endDate
      ? computeStatus(normalizedHackathon.startDate, normalizedHackathon.endDate)
      : normalizedHackathon.status || "upcoming";
  const style = statusStyles[status] || statusStyles.upcoming;
  const sharingData = generateEventSharingData({
    ...normalizedHackathon,
    date: normalizedHackathon.startDate,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)] ${
        isFeatured ? "ring-2 ring-indigo-400/50 dark:ring-indigo-500/40" : ""
      }`}
      {...props}
    >
      <div className={`h-[3px] w-full bg-gradient-to-r ${style.topBar}`} />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-slate-700/60 dark:text-slate-300">
              {normalizedHackathon.difficulty}
            </span>
            <UrgencyBadge
              startDate={normalizedHackathon.startDate}
              endDate={normalizedHackathon.endDate}
              status={status}
            />
          </div>

          <ShareMenu shareData={sharingData} position="bottom-right">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-slate-50 p-2 transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              aria-label={`Share ${normalizedHackathon.title}`}
            >
              <ShareIcon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </ShareMenu>
        </div>

        {isFeatured && (
          <span className="w-fit rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-600/20 dark:text-indigo-300">
            Featured
          </span>
        )}

        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Prize: {normalizedHackathon.prize}
        </span>

        <div className="border-t border-slate-100 dark:border-white/5" />

        <div className="min-h-[72px]">
          <h3 className="mb-1.5 text-base font-bold leading-snug text-slate-900 dark:text-white">
            {normalizedHackathon.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {normalizedHackathon.description}
          </p>
        </div>

        <div className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <BuildingLibraryIcon className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate">{normalizedHackathon.organizer}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-sky-500 dark:text-sky-400" />
            <span>
              {normalizedHackathon.startDate && normalizedHackathon.endDate
                ? formatDateRange(normalizedHackathon.startDate, normalizedHackathon.endDate)
                : "Dates TBA"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
            <span className="truncate">{normalizedHackathon.location}</span>
          </div>
        </div>

        {status === "upcoming" && normalizedHackathon.startDate && (
          <CountdownTimer targetDate={normalizedHackathon.startDate} label="Starts in" />
        )}
        {status === "live" && normalizedHackathon.endDate && (
          <CountdownTimer targetDate={normalizedHackathon.endDate} label="Ends in" />
        )}

        <div className="flex flex-wrap gap-2">
          {normalizedHackathon.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              {tech}
            </span>
          ))}
          {normalizedHackathon.techStack.length > 4 && (
            <span className="px-1.5 py-0.5 text-xs font-medium text-slate-400">
              +{normalizedHackathon.techStack.length - 4}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-white/10 dark:bg-white/5">
          {[
            { value: normalizedHackathon.participants, label: "Participants" },
            { value: normalizedHackathon.teams, label: "Teams" },
            { value: normalizedHackathon.submissions, label: "Submissions" },
          ].map(({ value, label }) => (
            <div key={label}>
              <UserGroupIcon className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
              <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                {value || 0}
              </div>
              <div className="text-[10px] font-medium text-slate-500">{label}</div>
            </div>
          ))}
        </div>

        {status === "completed" && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs dark:border-amber-500/20 dark:bg-amber-500/10">
            <TrophyIcon className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <span className="font-semibold text-slate-600 dark:text-slate-400">Winner:</span>
            <span className="truncate text-slate-700 dark:text-slate-300">
              {normalizedHackathon.winner || "Announced soon"}
            </span>
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3 pt-1">
          {status === "upcoming" ? (
            <>
              <button
                type="button"
                onClick={() => navigate(`/register/${normalizedHackathon.id}`)}
                className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
              >
                Register
              </button>
              <a
                href={addHackathonToGoogleCalendar(normalizedHackathon)}
                target="_blank" rel="noopener noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Reminder
              </a>
            </>
          ) : (
            <>
              <button
                type="button"
                className="rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
               aria-label="button">
                {status === "live" ? "Join Now" : "View Results"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
               aria-label="button">
                {status === "live" ? "Submit" : "Resources"}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default memo(HackathonCard);
