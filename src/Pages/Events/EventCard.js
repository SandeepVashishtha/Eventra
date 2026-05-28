import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { logger } from "../../utils/logger";
import { getUserTimezone } from "../../utils/timezoneUtils";
import { Link, useNavigate } from "react-router-dom";
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
import { addEventToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";
import StatusBadge from "../../components/common/StatusBadge";
import LazyImage from "../../components/common/LazyImage";
import { getEventStatus } from "../../utils/eventUtils";
import { useMyEvents } from "../../context/MyEventsContext";
import ReminderControls from "../../components/reminders/ReminderControls";
import {
  addBookmarkedEvent,
  isEventBookmarked,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";
import { getBookmarkedEvents } from "../../utils/bookmarkUtils";
import { checkRegistrationConflict } from "../../utils/conflictDetection";
// savedEvents state is component-scoped to avoid calling hooks at module level
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
  const navigate = useNavigate();
  const [savedEvents, setSavedEvents] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const titleId = useId();
  const { myEvents, isRegistered } = useMyEvents();
  const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(false);
  const [randomIcon] = useState(() => {
    const icons = [
      <Star size={16} className="text-yellow-500" />,
      <Heart size={16} className="text-red-500" />,
      <Zap size={16} className="text-pink-500" />,
      <BookOpen size={16} className="text-indigo-500" />,
      <Gift size={16} className="text-pink-500" />,
    ];

    return icons[Math.floor(Math.random() * icons.length)];
  });

  const eventDateTime = useMemo(
    () => new Date(`${event.date} ${event.time}`),
    [event.date, event.time],
  );
  const isPastEvent = eventDateTime < new Date();

  const eventSharingData = useMemo(
    () =>
      generateEventSharingData({
        ...event,
        title: event.title,
        description: event.description,
        date: event.date,
        id: event.id,
      }),
    [event],
  );
  // Check if this event conflicts with registered events
  const conflictCheck = checkRegistrationConflict(event, myEvents);
  const hasConflict = conflictCheck.hasConflict;
  const isUserRegistered = isRegistered(event.id);

  const isPastEvent = getEventStatus(event) === "past" || getEventStatus(event) === "ended";
useEffect(() => {
  const saved =
    getBookmarkedEvents();

  setSavedEvents(saved);
}, []);
  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id,
  });

  const handleCopyLink = useCallback((e) => {
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
  }, [event.id]);

  const computedStatus = useMemo(() => getEventStatus(event), [event]);
  const canSetReminder = isBookmarked || isRegistered(event.id);
  const formattedDate = useMemo(
    () =>
      new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    [event.date],
  );
  const capacityInfo = useMemo(() => {
    if (typeof event.maxAttendees !== "number" || event.maxAttendees <= 0) {
      return null;
    }

    const registered = Number(event.attendees) || 0;
    const capacity = Number(event.maxAttendees);
    const isFull = registered >= capacity;
    const ratio = Math.min(registered / capacity, 1);
    const percent = Math.round(ratio * 100);
    const spotsLeft = Math.max(capacity - registered, 0);

    const barColor = isFull
      ? "bg-red-500"
      : ratio >= 0.85
      ? "bg-red-500"
      : ratio >= 0.6
      ? "bg-amber-500"
      : "bg-emerald-500";

    const textColor = isFull
      ? "text-red-600 dark:text-red-400"
      : ratio >= 0.85
      ? "text-red-600 dark:text-red-400"
      : ratio >= 0.6
      ? "text-amber-600 dark:text-amber-400"
      : "text-emerald-600 dark:text-emerald-400";

    return {
      barColor,
      capacity,
      isFull,
      percent,
      registered,
      spotsLeft,
      textColor,
    };
  }, [event.attendees, event.maxAttendees]);

  useEffect(() => {
    setIsBookmarked(isEventBookmarked(event.id));

    return subscribeToBookmarkChanges(() => {
      setIsBookmarked(isEventBookmarked(event.id));
    });
  }, [event.id]);

  const handleBookmarkToggle = useCallback((e) => {
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
  }, [computedStatus, event, isBookmarked]);

  return (
    <article
      data-aos="zoom-in"
      data-aos-duration="800"
      aria-labelledby={titleId}
      aria-label={`Event: ${event.title}`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/events/${event.id}`); } }}
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 flex flex-col z-10 hover:z-50 hover:shadow-2xl hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
    >
      {/* Action buttons */}
      <div className="absolute top-[5.5rem] right-3 z-[200] flex space-x-1.5 items-center">
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
            className={`rounded-full p-2 shadow cursor-pointer border transition-all duration-300 relative flex items-center justify-center ${
              isBookmarked
                ? "border-indigo-400 dark:border-indigo-500 text-white bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.45)]"
                : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 bg-white/90 dark:bg-gray-900/90 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 hover:shadow-[0_0_12px_rgba(99,102,241,0.35)]"
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
                <Bookmark size={14} className="stroke-[2]" />
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
                className="absolute bottom-full right-0 mb-2 px-2.5 py-1 text-[10px] font-bold text-white bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-[300]"
              >
                {isBookmarked ? "Remove Bookmark" : "Save to Bookmarks"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ShareMenu
          shareData={eventSharingData}
          position="above"
          menuClassName="!z-[999] shadow-2xl"
          buttonClassName=""
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200 group/share">
            <Share2 size={14} className="text-gray-600" aria-hidden="true" />
          </div>
        </ShareMenu>

        <button
          type="button"
          onClick={handleCopyLink}
          className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200 group/copy relative focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Copy Event Link"
          aria-label={`Copy link for ${event.title}`}
        >
          {savedEvents.length > 0 && (
  <section className="mb-10">

    <div className="
      flex
      items-center
      justify-between
      mb-4
    ">
      <h2 className="
        text-2xl
        font-bold
        text-slate-900
        dark:text-white
      ">
        Saved Events
      </h2>
    </div>

    <div className="
      flex
      gap-4
      overflow-x-auto
      pb-2
    ">

      {savedEvents.map((saved) => (
        <div key={saved.id} className="min-w-[280px] flex-shrink-0">
          <Link
            to={`/events/${saved.id}`}
            className="block p-3 bg-white/90 dark:bg-gray-900/80 rounded-lg shadow-sm hover:shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{saved.title}</div>
            <div className="text-[11px] text-gray-500 truncate">{saved.location}</div>
          </Link>
        </div>
      ))}

    </div>

  </section>
)}
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
            className="text-gray-600"
            aria-hidden="true"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>

        <a
          href={addEventToGoogleCalendar(event)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Add to Google Calendar"
          aria-label={`Add ${event.title} to Google Calendar`}
          className="group/cal focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200">
            <Calendar size={14} className="text-gray-600" aria-hidden="true" />
          </div>
        </a>
      </div>

      {/* Header */}
      <div className="flex items-center px-5 py-4 gap-4 bg-gradient-to-r from-white/80 to-indigo-50/60 dark:from-gray-900/80 dark:to-indigo-950/60 border-b border-gray-100 dark:border-gray-800 rounded-t-3xl">
        <div className="p-2 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-inner flex-shrink-0">
          {randomIcon}
        </div>

        <h3 id={titleId} className="text-gray-900 dark:text-white font-bold text-lg tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 flex-1">
          {event.title}
        </h3>
        <div className="ml-auto flex items-center gap-2">
          {/* Conflict Indicator */}
          {hasConflict && !isUserRegistered && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full border border-amber-300 dark:border-amber-700"
              title="This event conflicts with your registered events"
            >
              <AlertTriangle size={12} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Conflict
              </span>
            </div>
          )}
          {/* Registered Indicator */}
          {isUserRegistered && (
            <div
              className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-300 dark:border-green-700"
              title="You are registered for this event"
            >
              <BookmarkCheck size={12} className="text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                Registered
              </span>
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
          width={800}
          height={160}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Description */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-6 line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* Info Grid */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/30">
        {/* Location */}
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-pink-500 flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="truncate">{event.location}</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {getUserTimezone()}
            </span>
          </div>
        </div>

        {/* Event Type */}
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-green-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{event.type}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-indigo-500 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{formattedDate}</span>
        {/* Event Date */}
        <div className="flex items-start gap-2">
          <Calendar size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="truncate">
              {getSmartDateLabel(event.date, event.time)}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short", day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <ReminderControls event={event} canSetReminder={canSetReminder} compact />
      </div>
      {/* Seats / Capacity */}
      {capacityInfo && (
      {typeof event.maxAttendees === "number" && event.maxAttendees > 0 && (() => {
        const registered = Number(event.attendees) || 0;
        const capacity = Number(event.maxAttendees);
        const isFull = registered >= capacity;
        const ratio = Math.min(registered / capacity, 1);
        const percent = Math.round(ratio * 100);
        const spotsLeft = Math.max(capacity - registered, 0);

        const { barColor, textColor } = getCapacityStyles(ratio, isFull);

        return (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Seats
              </span>
              {capacityInfo.isFull ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  Full
                </span>
              ) : (
                <span className={`text-xs font-semibold tabular-nums ${capacityInfo.textColor}`}>
                  {capacityInfo.spotsLeft} spot{capacityInfo.spotsLeft === 1 ? "" : "s"} left
                </span>
              )}
            </div>
            <div
              className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
              role="progressbar"
              aria-valuenow={capacityInfo.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${capacityInfo.registered} of ${capacityInfo.capacity} seats filled`}
            >
              <div
                className={`h-full ${capacityInfo.barColor} transition-all duration-500 ease-out`}
                style={{ width: `${capacityInfo.percent}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-500 tabular-nums">
              {capacityInfo.registered} / {capacityInfo.capacity} registered
            </div>
          </div>
      )}

      {/* CTA */}
      <div className="px-5 py-4 flex gap-3 mt-auto">
        {isPastEvent ? (
          <div className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-3 text-sm font-semibold shadow-md cursor-not-allowed">
            Event Ended
          </div>
        ) : (
          <Link to={`/events/${event.id}/register`} className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl">
            <span>
              Register Now
            </span>
          </Link>
        )}

        <Link to={`/events/${event.id}`} aria-label={`View details for ${event.title}`} className="flex-1 inline-flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 px-4 py-3 text-sm font-semibold shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-white hover:scale-[1.03] hover:shadow-lg transition-all duration-300">
          <span>
            View Details
          </span>
        </Link>
      </div>
    </article>
  );
};

export default memo(EventCard);
// OPTIMIZATION: Implemented image lazy-loading, decoding='async' and standard aspect-ratio styles to minimize Cumulative Layout Shift (CLS).
