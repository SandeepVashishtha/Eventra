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
  DocumentTextIcon,
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

// Countdown Timer
const CountdownTimer = ({ targetDate, label }) => {
  const timeLeft = useCountdown(targetDate);

  if (!timeLeft) {
    return (
      <span className="text-red-500 font-semibold text-xs">
        Deadline passed
      </span>
    );
  }

  const isUrgent = timeLeft.days < 3;
  const isVerySoon = timeLeft.days === 0;

  return (
    <div
      className={`flex items-center gap-2 ${
        isUrgent ? "text-red-500" : "text-blue-500"
      }`}
    >
      <ClockIcon className={`w-4 h-4 ${isUrgent ? "animate-pulse" : ""}`} />

      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}:
      </span>

      <div className="flex items-center gap-1 font-mono text-xs font-bold">
        {timeLeft.days > 0 && (
          <span
            className={`px-1.5 py-0.5 rounded ${
              isUrgent
                ? "bg-red-100 dark:bg-red-900/50 text-red-600"
                : "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
            }`}
          >
            {timeLeft.days}d
          </span>
        )}

        <span
          className={`px-1.5 py-0.5 rounded ${
            isUrgent
              ? "bg-red-100 dark:bg-red-900/50 text-red-600"
              : "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
          }`}
        >
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>

        <span
          className={`px-1.5 py-0.5 rounded ${
            isUrgent
              ? "bg-red-100 dark:bg-red-900/50 text-red-600"
              : "bg-blue-100 dark:bg-blue-900/50 text-blue-600"
          }`}
        >
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>

        {isVerySoon && (
          <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/50 text-red-600">
            {String(timeLeft.seconds).padStart(2, "0")}s
          </span>
        )}
      </div>
    </div>
  );
};

// Urgency Badge
const UrgencyBadge = ({ startDate, endDate, status }) => {
  const timeLeft = useCountdown(status === "upcoming" ? startDate : endDate);

  if (status === "completed") return null;
  if (!timeLeft) return null;

  if (timeLeft.days < 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
        🔥 Closing Today!
      </span>
    );
  }

  if (timeLeft.days < 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-400 text-white text-xs font-bold">
        ⚡ Closing Soon
      </span>
    );
  }

  return null;
};

// FIX 3: Compute status dynamically from dates instead of relying on hardcoded JSON field
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
    techStack:
      Array.isArray(hackathon?.techStack) && hackathon.techStack.length > 0
        ? hackathon.techStack
        : ["General"],
    rules:
      Array.isArray(hackathon?.rules) && hackathon.rules.length > 0
        ? hackathon.rules
        : ["Rules will be shared before the hackathon starts."],
    participants: hackathon?.participants ?? 0,
    teams: hackathon?.teams ?? 0,
    submissions: hackathon?.submissions ?? 0,
    winner: hackathon?.winner || "",
  };

  // FIX 3: Use computed status everywhere instead of hackathon.status

  const status = computeStatus(hackathon.startDate, hackathon.endDate);
  const safeTechStack = hackathon?.techStack || [];
  const safeRules = hackathon?.rules || [];


  // Show real stats for ALL statuses (live, upcoming, completed)
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

  // FIX 3: Pass computed status (not hackathon.status) to UrgencyBadge
  // (used below in JSX)

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        rotateX: 15,
        scale: 0.95,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
      }}
      className={`
        h-full
        bg-gradient-to-br
        from-white
        to-white
        dark:from-gray-800
        dark:to-black
        rounded-xl
        shadow-sm
        hover:shadow-md
        transition-all
        duration-300
        border
        border-blue-200
        dark:border-gray-700
        relative
        flex
        flex-col
        card-with-floating-elements
        ${isFeatured ? "ring-2 ring-blue-300 dark:ring-blue-400" : ""}
      `}
      {...props}
    >
      {/* Featured Ribbon */}
      {isFeatured && (
        <div className="absolute top-0 right-0 bg-black text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          Featured
        </div>
      )}

      {/* Share Button */}
      <div className="absolute -top-4 -right-4 z-[200]">
        <ShareMenu
          shareData={hackathonSharingData}
          position="bottom-right"
          menuClassName="!z-[999] shadow-2xl"
          buttonClassName=""
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg cursor-pointer hover:shadow-xl border border-gray-200 dark:border-gray-600 group/share"
            whileHover={{ scale: 1.1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 10,
            }}
          >
            <ShareIcon className="w-4 h-4 text-gray-400" />
          </motion.div>
        </ShareMenu>
      </div>

      {/* Main Content */}
      <div className="p-6 flex flex-col gap-5 h-full min-h-[500px]">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                status === "live"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                  : status === "upcoming"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              }`}
            >
              {/* FIX 3: Use computed status label */}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-medium">
              {normalizedHackathon.difficulty}
            </span>

            {/* FIX 3: Pass computed status to UrgencyBadge */}
            <UrgencyBadge
              startDate={normalizedHackathon.startDate}
              endDate={normalizedHackathon.endDate}
              status={status}
            />
          </div>

          <span className="text-white text-sm font-semibold px-3 py-1 rounded-full bg-black">
            {normalizedHackathon.prize}
          </span>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Title */}
        <div className="min-h-[72px]">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {normalizedHackathon.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 min-h-[40px]">
            {normalizedHackathon.description}
          </p>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Organizer */}
        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm gap-1.5 min-h-[32px]">
          <BuildingLibraryIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <span>{normalizedHackathon.organizer}</span>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Date & Location */}
        <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-400 text-sm min-h-[120px]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-500" />
            {new Date(hackathon.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(hackathon.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>

          <div className="flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-green-500" />
            {normalizedHackathon.location}
          </div>

          {/* FIX 3: Use computed status for countdown logic */}
          {status === "upcoming" && hackathon.startDate && (
            <CountdownTimer
              targetDate={hackathon.startDate}
              label="Starts in"
            />
          )}

          {status === "live" && hackathon.endDate && (
            <CountdownTimer targetDate={hackathon.endDate} label="Ends in" />
          )}
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Tech Stack */}
        <div className="min-h-[72px]">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Tech Stack:
          </h4>

          <div className="flex flex-wrap gap-2">

            {safeTechStack.map((tech, index) => (

              <span
                key={index}
                className="px-3 py-1 border border-blue-200 dark:border-blue-700 bg-blue-100 dark:bg-blue-900/60 text-gray-800 dark:text-gray-200 text-xs font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Rules */}
        <div className="text-gray-600 dark:text-gray-400 text-sm min-h-[100px]">
          <h4 className="font-medium mb-1 flex items-center gap-1.5">
            <DocumentTextIcon className="w-4 h-4 text-blue-500" />
            Rules
          </h4>

          <ul className="list-disc list-inside text-xs line-clamp-3 min-h-[60px]">
          
            {safeRules.map((rule, index) => (

              <li key={index}>{rule}</li>
            ))}
          </ul>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg min-h-[90px]">
          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-red-500 mx-auto mb-1" />

            <div className="text-lg font-bold text-red-500">
              {stats.participants || "--"}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Participants
            </div>
          </div>

          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-green-500 mx-auto mb-1 rotate-90" />

            <div className="text-lg font-bold text-green-500">
              {stats.teams || "--"}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Teams
            </div>
          </div>

          <div className="text-center">
            <UserGroupIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />

            <div className="text-lg font-bold text-blue-500">
              {stats.submissions || "--"}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Submissions
            </div>
          </div>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700" />

        {/* Winner */}
        <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/40 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 min-h-[60px]">
          <TrophyIcon className="w-5 h-5 text-yellow-500" />

          <span className="text-sm font-medium">Winner:</span>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            {/* FIX 3: Use computed status for winner display */}
            {status === "completed" && normalizedHackathon.winner
              ? normalizedHackathon.winner
              : "Announced soon"}
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-3 mt-auto">
          {/* FIX 3: Use computed status for button rendering */}
          {status === "live" ? (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white text-sm font-medium rounded-lg">
                Join Now
              </button>

              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg">
                Submit Project
              </button>
            </div>
          ) : status === "upcoming" ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/register/${hackathon.id}`)}
                className="..."
              >
                Register
              </button>

              <a
                href={addHackathonToGoogleCalendar(normalizedHackathon)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg">
                  Reminder
                </button>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-2 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white text-sm font-medium rounded-lg">
                View Results
              </button>

              <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg">
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
