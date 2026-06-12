import { memo, useCallback, useEffect, useId, useState } from "react";
import { logger } from "../../utils/logger";
import { getUserTimezone } from "../../utils/timezoneUtils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSmartDateLabel } from "../../utils/relativeTime";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Tag,
  Star,
  Heart,
  Zap,
  BookOpen,
  Gift,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import LazyImage from "../../components/common/LazyImage";
import ShareModal from "../../components/common/ShareModal";
import StatusBadge from "../../components/common/StatusBadge";
import { getEventStatus } from "../../utils/eventUtils";
import { useMyEvents } from "../../context/MyEventsContext";
import ReminderControls from "../../components/reminders/ReminderControls";
import AddToCalendar from "../../components/common/AddToCalendar";
import SocialShareButtons from "../../components/common/SocialShareButtons";
import {
  addBookmarkedEvent,
  isEventBookmarked,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";
import { checkRegistrationConflict } from "../../utils/conflictDetection";

const getCapacityStyles = (ratio, isFull) => {
  if (isFull || ratio >= 0.85) {
    return {
      barColor: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    };
  }
  if (ratio >= 0.6) {
    return {
      barColor: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    barColor: "bg-emerald-500",
    textColor: "text-emerald-600 dark:text-emerald-400",
  };
};

const EventCard = ({ event }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const titleId = useId();
  const { myEvents, isRegistered } = useMyEvents();
  const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [randomIcon] = useState(() => {
    const icons = [
      <Star key="star" size={16} className="text-yellow-500" />,
      <Heart key="heart" size={16} className="text-red-500" />,
      <Zap key="zap" size={16} className="text-pink-500" />,
      <BookOpen key="book-open" size={16} className="text-indigo-500" />,
      <Gift key="gift" size={16} className="text-pink-500" />,
    ];

    return icons[Math.floor(Math.random() * icons.length)];
  });

  // Check if this event conflicts with registered events
  const conflictCheck = checkRegistrationConflict(event, myEvents);
  const hasConflict = conflictCheck.hasConflict;
  const isUserRegistered = isRegistered(event.id);

  const isPastEvent = getEventStatus(event) === "past" || getEventStatus(event) === "ended";

  const handleCopyLink = (e) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/events/${event.id}`;

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success("Event link copied to clipboard!", {
          autoClose: 2000,
        });
      })
      .catch((err) => {
        logger.error("Failed to copy: ", err);
        toast.error("Could not copy link. Please try again.", {
          autoClose: 2500,
        });
      });
  };

  const computedStatus = getEventStatus(event);
  const canSetReminder = isBookmarked || isRegistered(event.id);

  useEffect(() => {
    setIsBookmarked(isEventBookmarked(event.id));

    return subscribeToBookmarkChanges(() => {
      setIsBookmarked(isEventBookmarked(event.id));
    });
  }, [event.id]);

  const handleBookmarkToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isBookmarked) {
        removeBookmarkedEvent(event.id);
        toast.info("Removed from bookmarked events.", {
          toastId: `bookmark-${event.id}`,
          autoClose: 1800,
          className: "custom-toast",
        });
        return;
      }

      addBookmarkedEvent({
        ...event,
        status: computedStatus,
      });
      toast.success("Event bookmarked.", {
        toastId: `bookmark-${event.id}`,
        autoClose: 1800,
        className: "custom-toast",
      });
    },
    [isBookmarked, event, computedStatus]
  );

  return (
    <article
      data-aos="zoom-in"
      data-aos-duration="800"
      aria-labelledby={titleId}
      className="group event-card-hoverable relative z-10 flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100"
    >
      {/* Action buttons */}
      <div className="absolute top-3 right-3 z-200 flex items-center space-x-1.5">
        <div className="relative flex items-center">
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            type="button"
            onClick={handleBookmarkToggle}
            onMouseEnter={() => setShowBookmarkTooltip(true)}
            onMouseLeave={() => setShowBookmarkTooltip(false)}
            aria-label={isBookmarked ? "Remove event bookmark" : "Bookmark event"}
            aria-pressed={isBookmarked}
            className={`relative flex cursor-pointer items-center justify-center rounded-full border p-2 shadow transition-all duration-300 ${
              isBookmarked
                ? "border-indigo-400 bg-linear-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.45)] dark:border-indigo-500"
                : "border-gray-200 bg-white/90 text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-[0_0_12px_rgba(99,102,241,0.35)] dark:border-gray-800 dark:bg-gray-900/90 dark:text-gray-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
            }`}
          >
            <motion.div
              key={isBookmarked ? "bookmarked" : "unbookmarked"}
              initial={{ scale: 0.65, rotate: isBookmarked ? 15 : -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
              className="flex items-center justify-center"
            >
              {isBookmarked ? (
                <BookmarkCheck size={14} className="stroke-[2.5]" />
              ) : (
                <Bookmark size={14} className="stroke-2" />
              )}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showBookmarkTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="pointer-events-none absolute right-0 bottom-full z-300 mb-2 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-bold whitespace-nowrap text-white shadow-xl dark:bg-slate-950"
              >
                {isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsShareModalOpen(true);
          }}
          className="group/share cursor-pointer rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm transition-all duration-200 hover:shadow-md"
          aria-label={`Share ${event.title}`}
        >
          <Share2 size={14} className="text-gray-600" aria-hidden="true" />
        </button>

        <AnimatePresence>
          {isShareModalOpen && (
            <ShareModal
              isOpen={isShareModalOpen}
              onClose={() => setIsShareModalOpen(false)}
              event={event}
            />
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm transition-all duration-200 hover:border-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800/90 dark:hover:border-indigo-500"
          title="Copy Event Link"
          aria-label={`Copy link for ${event.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600 dark:text-gray-300"
            aria-hidden="true"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>

        <AddToCalendar event={event} iconOnly={true} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 rounded-t-3xl border-b border-gray-100 bg-linear-to-r from-white/80 to-indigo-50/60 px-5 py-4 dark:border-gray-800 dark:from-gray-900/80 dark:to-indigo-950/60">
        <div className="shrink-0 rounded-xl bg-linear-to-br from-gray-100 to-white p-2 shadow-inner dark:from-gray-800 dark:to-gray-700">
          {randomIcon}
        </div>

        <h3
          id={titleId}
          title={event.title}
          className="line-clamp-2 min-w-0 flex-1 text-lg font-bold tracking-tight break-words text-gray-900 transition-colors duration-300 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
        >
          {event.title}
        </h3>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {/* Conflict Indicator */}
          {hasConflict && !isUserRegistered && (
            <div
              className="inline-flex shrink-0 items-center gap-[5px] rounded-[6px] border border-amber-300 bg-amber-100 px-[10px] py-1 text-[12px] leading-none font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              title="This event conflicts with your registered events"
            >
              <AlertTriangle
                size={12}
                className="shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <span>Conflict</span>
            </div>
          )}
          {/* Registered Indicator */}
          {isUserRegistered && (
            <div
              className="inline-flex shrink-0 items-center gap-[5px] rounded-[6px] border border-green-300 bg-green-100 px-[10px] py-1 text-[12px] leading-none font-medium text-green-700 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
              title="You are registered for this event"
            >
              <BookmarkCheck
                size={12}
                className="shrink-0 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <span>Registered</span>
            </div>
          )}
          <StatusBadge status={computedStatus} />
        </div>
      </div>

      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <LazyImage
          src={event.image}
          alt={event.imageAlt || `${event.title} event thumbnail`}
          aspectRatio="5/1"
          className="h-full w-full"
          imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Description */}
      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <p className="line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {event.description}
        </p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 bg-gray-50/50 px-5 py-4 text-sm text-gray-600 sm:grid-cols-2 dark:bg-gray-800/30 dark:text-gray-400">
        {/* Location */}
        <div className="flex items-start gap-2 sm:col-span-2">
          <MapPin size={14} className="shrink-0 text-pink-500" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate">{event.location}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {getUserTimezone()}
            </span>
          </div>
        </div>

        {/* Event Type */}
        <div className="flex items-center gap-2">
          <Tag size={14} className="shrink-0 text-green-500" aria-hidden="true" />
          <span className="truncate">{event.type}</span>
        </div>

        {/* Event Date */}
        <div className="flex items-start gap-2">
          <Calendar size={14} className="mt-0.5 shrink-0 text-indigo-500" />
          <div className="flex flex-col">
            <span className="truncate">{getSmartDateLabel(event.date, event.time)}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
        <ReminderControls event={event} canSetReminder={canSetReminder} compact />
      </div>
      {/* Seats / Capacity */}
      {typeof event.maxAttendees === "number" &&
        event.maxAttendees > 0 &&
        (() => {
          const registered = Number(event.attendees) || 0;
          const capacity = Number(event.maxAttendees);
          const isFull = registered >= capacity;
          const ratio = Math.min(registered / capacity, 1);
          const percent = Math.round(ratio * 100);
          const spotsLeft = Math.max(capacity - registered, 0);

          const { barColor, textColor } = getCapacityStyles(ratio, isFull);

          return (
            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Seats</span>
                {isFull ? (
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                    Full
                  </span>
                ) : (
                  <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
                    {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                  </span>
                )}
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${registered} of ${capacity} seats filled`}
              >
                <div
                  className={`h-full ${barColor} transition-all duration-500 ease-out`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-gray-500 tabular-nums dark:text-gray-500">
                {registered} / {capacity} registered
              </div>
            </div>
          );
        })()}

      {/* Social Sharing */}
      <div className="flex justify-center border-t border-gray-100 bg-white px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
        <SocialShareButtons event={event} layout="inline" />
      </div>

      {/* CTA */}
      <div className="mt-auto flex gap-3 px-5 py-4">
        {isPastEvent ? (
          <div className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-2xl bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 shadow-md dark:bg-gray-700 dark:text-gray-300">
            Event Ended
          </div>
        ) : (
          <Link
            to={`/events/${event.id}/register`}
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-linear-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl"
          >
            <span>Register Now</span>
          </Link>
        )}

        <Link
          to={`/events/${event.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-slate-100 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
        >
          <span>View Details</span>
        </Link>
      </div>
    </article>
  );
};

export default memo(EventCard);
// OPTIMIZATION: Implemented image lazy-loading, decoding='async' and standard aspect-ratio styles to minimize Cumulative Layout Shift (CLS).
