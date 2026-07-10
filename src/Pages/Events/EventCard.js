import React, { memo, useCallback, useId, useState } from "react";
import { logger } from "../../utils/logger";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Users,
  Share2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Zap,
  Star,
  Award,
  Cpu,
  Globe,
  Music,
  Briefcase,
  Code,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import LazyImage from "../../components/common/LazyImage";
import ShareModal from "../../components/common/ShareModal";
import StatusBadge from "../../components/common/StatusBadge";
import { getEventStatus } from "../../utils/eventUtils";
import SocialShareButtons from "../../components/common/SocialShareButtons";
import AddToCalendar from "../../components/common/AddToCalendar";
import { useMyEvents } from "../../context/MyEventsContext";
import MatchScoreBadge from "../../components/common/MatchScoreBadge";
import SocialShareButtons from "../../components/common/SocialShareButtons";
import AddToCalendar from "../../components/common/AddToCalendar";
import {
  isEventBookmarked,
} from "../../utils/bookmarkUtils";
import { checkRegistrationConflict } from "../../utils/conflictDetection";

const CARD_GRADIENTS = [
  "from-violet-600 via-purple-600 to-indigo-700",
  "from-rose-500 via-pink-600 to-purple-700",
  "from-cyan-500 via-blue-600 to-indigo-700",
  "from-emerald-500 via-teal-600 to-cyan-700",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-fuchsia-600 via-pink-600 to-rose-600",
  "from-sky-500 via-blue-500 to-violet-600",
  "from-green-500 via-emerald-600 to-teal-700",
];

const CATEGORY_ICONS = {
  ai: Cpu,
  tech: Code,
  technology: Code,
  music: Music,
  business: Briefcase,
  global: Globe,
  summit: Award,
  conference: Award,
  hackathon: Zap,
  bootcamp: Star,
  networking: Globe,
  cultural: Heart,
  default: Star,
};

const getCategoryIcon = (event) => {
  const titleLower = (event.title || "").toLowerCase();
  const typeLower = (event.type || event.category || "").toLowerCase();
  const text = `${titleLower} ${typeLower}`;
  for (const [key, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key !== "default" && text.includes(key)) return Icon;
  }
  return CATEGORY_ICONS.default;
};

const getCardGradient = (id) => {
  const index = (parseInt(id, 10) || 0) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[index];
};

const formatEventDate = (dateValue) => {
  if (!dateValue) return { short: "TBD", full: "Date TBD", relative: "" };
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return { short: "TBD", full: "Date TBD", relative: "" };

  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let relative = "";
  if (diffMs < 0) {
    relative = "Past";
  } else if (diffDays === 0) {
    relative = "Today";
  } else if (diffDays === 1) {
    relative = "Tomorrow";
  } else if (diffDays < 7) {
    relative = `In ${diffDays} days`;
  } else if (diffDays < 30) {
    relative = `In ${Math.round(diffDays / 7)} week${Math.round(diffDays / 7) !== 1 ? "s" : ""}`;
  } else {
    relative = `In ${Math.round(diffDays / 30)} month${Math.round(diffDays / 30) !== 1 ? "s" : ""}`;
  }

  const short = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const full = d.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return { short, full, relative, time };
};

const CapacityBar = ({ attendees, maxAttendees }) => {
  const registered = Number(attendees) || 0;
  const capacity = Number(maxAttendees);
  if (!capacity) return null;

  const isFull = registered >= capacity;
  const ratio = Math.min(registered / capacity, 1);
  const percent = Math.round(ratio * 100);
  const spotsLeft = Math.max(capacity - registered, 0);

  const barColor = isFull || ratio >= 0.85
    ? "bg-red-500"
    : ratio >= 0.6
    ? "bg-amber-500"
    : "bg-indigo-500";

  return (
    <div className="px-5 py-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-text-light/60" />
          <span className="text-xs text-text-light font-semibold">Capacity</span>
        </div>
        {isFull ? (
          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 uppercase tracking-wider">
            SOLD OUT
          </span>
        ) : (
          <span className="text-xs font-semibold text-text-light/80">
            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
          </span>
        )}
      </div>
      <div className="w-full h-1 rounded-full bg-slate-200/50 dark:bg-slate-800/40 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>
      <div className="mt-1.5 text-[10px] text-text-light/60 font-mono">
        {registered} / {capacity} registered
      </div>
    </div>
  );
};

const EventCard = ({ event, matchScore, matchReasons }) => {
  const [isBookmarked] = useState(() => isEventBookmarked(event.id));
  const [imageFailed, setImageFailed] = useState(false);
  const titleId = useId();
  const { myEvents, isRegistered } = useMyEvents();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const conflictCheck = checkRegistrationConflict(event, myEvents);
  const hasConflict = conflictCheck.hasConflict;
  const isUserRegistered = isRegistered(event.id);
  const computedStatus = getEventStatus(event);
  const isPastEvent = computedStatus === "past" || computedStatus === "ended";

  const eventImage = event.image || event.imageUrl || null;
  const eventDate = event.date || event.eventDate || event.startDate || null;
  const dateInfo = formatEventDate(eventDate);
  const categoryIcon = getCategoryIcon(event);
  const gradient = getCardGradient(event.id);

  const handleCopyLink = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      .writeText(`${window.location.origin}/events/${event.id}`)
      .then(() => toast.success("Link copied!", { autoClose: 1800 }))
      .catch((err) => {
        logger.error("Copy failed:", err);
        toast.error("Could not copy link.", { autoClose: 2000 });
      });
  }, [event.id]);

  const handleBookmarkToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isBookmarked) {
        removeBookmarkedEvent(event.id);
        setIsBookmarked(false);
        toast.info("Removed from saved events.", { toastId: `bookmark-${event.id}`, autoClose: 1800 });
      } else {
        addBookmarkedEvent({ ...event, status: computedStatus });
        setIsBookmarked(true);
        toast.success("Event saved!", { toastId: `bookmark-${event.id}`, autoClose: 1800 });
      }
    },
    [isBookmarked, event, computedStatus]
  );

  return (
    <motion.article
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-card-bg border border-border shadow-premium-sm hover:shadow-premium-lg hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-300"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${eventImage ? "opacity-15" : "opacity-80"}`} />

        {eventImage && !imageFailed ? (
          <LazyImage
            src={eventImage}
            alt={`${event.title} event banner`}
            className="absolute inset-0 w-full h-full"
            imgClassName="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-700"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {categoryIcon && React.createElement(categoryIcon, { size: 52, className: "text-white/20" })}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/40 to-transparent" />

        <div className="absolute top-3 left-3">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5">
            {categoryIcon && React.createElement(categoryIcon, { size: 12, className: "text-white/80" })}
            <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">
              {event.type || event.category || "Event"}
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5">
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
            aria-pressed={isBookmarked}
            className={`rounded-full p-2 backdrop-blur-md border transition-all duration-200 ${
              isBookmarked
                ? "bg-indigo-500/80 border-indigo-400/60 text-white"
                : "bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShareModalOpen(true); }}
            className="rounded-full p-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            aria-label={`Share ${event.title}`}
          >
            <Share2 size={14} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleCopyLink}
            className="rounded-full p-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            title="Copy event link"
            aria-label={`Copy link for ${event.title}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </motion.button>
        </div>

        <div className="absolute bottom-3 right-3">
          <StatusBadge status={computedStatus} />

          {/* AI match confidence badge — rendered when matchScore is supplied
              (e.g. from useRecommendations / EventsPage sort-by-match) */}
          {matchScore !== undefined && matchScore !== null && (
            <MatchScoreBadge
              score={matchScore}
              reasons={matchReasons}
              className="mt-1"
            />
          )}
        </div>

        {(isUserRegistered || (hasConflict && !isUserRegistered)) && (
          <div className="absolute bottom-3 left-3">
            {isUserRegistered ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/40 rounded-full text-[11px] font-semibold text-green-400">
                <BookmarkCheck size={10} />
                Registered
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[11px] font-semibold text-amber-400">
                <AlertTriangle size={10} />
                Conflict
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <h3
          id={titleId}
          title={event.title}
          className="text-text font-bold text-base leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200"
        >
          {event.title}
        </h3>

        <p className="text-text-light/90 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 -mt-1">
          {event.description}
        </p>

        <div className="flex flex-col gap-2.5 mt-1">
          {event.location && (
            <div className="flex items-center gap-2 text-xs font-semibold text-text-light truncate">
              <MapPin size={14} className="text-text-light/50 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-text-light">
            <Calendar size={14} className="text-text-light/50 flex-shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span>{dateInfo.full !== "Date TBD" ? dateInfo.full : "Date TBD"}</span>
              {dateInfo.time && dateInfo.full !== "Date TBD" && (
                <>
                  <span className="text-text-light/30">|</span>
                  <Clock size={12} className="text-text-light/40 flex-shrink-0" />
                  <span>{dateInfo.time}</span>
                </>
              )}
            </div>
          </div>

          {dateInfo.relative && (
            <div className="flex items-center gap-2">
              <div className="w-3.5" />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                dateInfo.relative === "Past"
                  ? "bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400"
                  : dateInfo.relative === "Today"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              }`}>
                {dateInfo.relative}
              </span>
            </div>
          )}
        </div>
      </div>

      {typeof event.maxAttendees === "number" && event.maxAttendees > 0 && (
        <CapacityBar attendees={event.attendees} maxAttendees={event.maxAttendees} />
      )}

      <div className="px-5 py-2.5 border-t border-border flex items-center justify-between">
        <SocialShareButtons event={event} layout="inline" />
        <AddToCalendar event={event} iconOnly={true} />
      </div>

      <div className="px-4 py-3.5 flex gap-2.5 border-t border-border bg-slate-50/30 dark:bg-slate-950/10">
        {isPastEvent ? (
          <div className="flex-1 inline-flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-4 py-2 text-xs font-semibold cursor-not-allowed select-none">
            Event Ended
          </div>
        ) : (
          <Link
            to={`/events/${event.id}/register`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-900 dark:hover:bg-slate-100 px-4 py-2 text-xs font-bold shadow-premium-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Register Now
          </Link>
        )}
        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-slate-900/60 border border-border text-text-light hover:text-text hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-semibold shadow-premium-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          Details
          <ArrowRight size={13} />
        </Link>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            event={event}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default memo(EventCard);