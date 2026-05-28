import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logger } from "../../utils/logger";
import { motion, AnimatePresence } from "framer-motion";
import { getSmartDateLabel } from "../../utils/relativeTime";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  Clock,
  Tag,
  Star,
  Heart,
  Zap,
  BookOpen,
  Gift,
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";
import { addEventToGoogleCalendar } from "../../utils/calendarUtils";
import ShareMenu from "../../components/common/ShareMenu";
import { generateEventSharingData } from "../../utils/shareUtils";
import StatusBadge from "../../components/common/StatusBadge";
import { getEventStatus } from "../../utils/eventUtils";
import { useMyEvents } from "../../context/MyEventsContext";
import ReminderControls from "../../components/reminders/ReminderControls";
import LazyImage from "../../components/common/LazyImage";
import {
  addBookmarkedEvent,
  isEventBookmarked,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";

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

const EventCard = ({ event, index }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const titleId = useId();
  const { isRegistered } = useMyEvents();

  const [randomIcon] = useState(() => {
    const icons = [
      <Star key="star" size={16} className="text-yellow-500" aria-hidden="true" />,
      <Heart key="heart" size={16} className="text-red-500" aria-hidden="true" />,
      <Zap key="zap" size={16} className="text-pink-500" aria-hidden="true" />,
      <BookOpen key="book" size={16} className="text-indigo-500" aria-hidden="true" />,
      <Gift key="gift" size={16} className="text-pink-500" aria-hidden="true" />,
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  });

  const computedStatus = useMemo(() => getEventStatus(event), [event]);
  const eventDateTime = useMemo(
    () => new Date(`${event.date} ${event.time}`),
    [event.date, event.time]
  );
  const isPastEvent = computedStatus === "past" || computedStatus === "ended" || eventDateTime < new Date();
  const isUserRegistered = isRegistered(event.id);

  const eventSharingData = useMemo(
    () =>
      generateEventSharingData({
        ...event,
        title: event.title,
        description: event.description,
        date: event.date,
        id: event.id,
      }),
    [event]
  );

  const canSetReminder = isBookmarked || isUserRegistered;

  const formattedDate = useMemo(
    () =>
      new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    [event.date]
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
    const styles = getCapacityStyles(ratio, isFull);

    return {
      capacity,
      isFull,
      percent,
      registered,
      spotsLeft,
      ...styles,
    };
  }, [event.attendees, event.maxAttendees]);

  useEffect(() => {
    setIsBookmarked(isEventBookmarked(event.id));

    return subscribeToBookmarkChanges(() => {
      setIsBookmarked(isEventBookmarked(event.id));
    });
  }, [event.id]);

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
      aria-labelledby={titleId}
      className="group relative z-10 flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 hover:z-50 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-indigo-700"
      aria-label={`Event: ${event.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/events/${event.id}`);
        }
      }}
    >
      <div className="absolute right-3 top-[5.5rem] z-20 flex space-x-1.5">
        <button
          type="button"
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Remove event bookmark" : "Bookmark event"}
          aria-pressed={isBookmarked}
          title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
          className={`min-h-[36px] min-w-[36px] rounded-full border p-2 shadow transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isBookmarked
              ? "border-indigo-200 bg-indigo-50/95 text-indigo-600"
              : "border-gray-200 bg-white/90 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
          }`}
        >
          {isBookmarked ? (
            <BookmarkCheck size={14} fill="currentColor" aria-hidden="true" />
          ) : (
            <Bookmark size={14} aria-hidden="true" />
          )}
        </button>

        <ShareMenu
          shareData={eventSharingData}
          position="above"
          menuClassName="!z-[999] shadow-2xl"
        >
          <div className="rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm">
            <Share2 size={14} className="text-gray-600" aria-hidden="true" />
          </div>
        </ShareMenu>

        <button
          type="button"
          onClick={handleCopyLink}
          className="relative min-h-[36px] min-w-[36px] rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
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
          className="rounded-full focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div className="rounded-full border border-gray-200 bg-white/90 p-2 shadow backdrop-blur-sm">
            <Calendar size={14} className="text-gray-600" aria-hidden="true" />
          </div>
        </a>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-100 bg-gradient-to-r from-white/80 to-indigo-50/60 px-5 py-4 dark:border-gray-800 dark:from-gray-900/80 dark:to-indigo-950/60">
        <div className="shrink-0 rounded-xl bg-gradient-to-br from-gray-100 to-white p-2 shadow-inner dark:from-gray-800 dark:to-gray-700">
          {randomIcon}
        </div>

        <h3
          id={titleId}
          className="flex-1 truncate text-lg font-bold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400"
        >
          {event.title}
        </h3>
        <div className="ml-auto">
          <StatusBadge status={computedStatus} />
        </div>
      </div>

      <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <LazyImage
          src={event.image}
          alt={event.imageAlt || `${event.title} event thumbnail`}
          width={800}
          height={160}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <p className="line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {event.description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-3 bg-gray-50/50 px-5 py-4 text-sm text-gray-600 dark:bg-gray-800/30 dark:text-gray-400 xs:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin size={14} className="shrink-0 text-pink-500" aria-hidden="true" />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Clock size={14} className="shrink-0 text-blue-500" aria-hidden="true" />
          <span className="truncate">{event.time}</span>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <Tag size={14} className="shrink-0 text-green-500" aria-hidden="true" />
          <span className="truncate">{event.type}</span>
        </div>

        <div className="flex min-w-0 items-start gap-2">
          <Calendar size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="truncate">
              {getSmartDateLabel(event.date, event.time)}
            </span>
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

      {capacityInfo && (
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

      <div className="mt-auto flex gap-3 px-5 py-4">
        {isPastEvent ? (
          <div className="inline-flex min-h-[44px] flex-1 cursor-not-allowed items-center justify-center rounded-2xl bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-600 shadow-md dark:bg-gray-700 dark:text-gray-300">
            Event Ended
          </div>
        ) : (
          <Link
            to={`/events/${event.id}/register`}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 hover:shadow-xl sm:hover:scale-[1.03]"
          >
            Register Now
          </Link>
        )}

        <Link
          to={`/events/${event.id}`}
          aria-label={`View details for ${event.title}`}
          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 px-4 py-3 text-sm font-semibold shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-white hover:scale-[1.03] hover:shadow-lg transition-all duration-300"
        >
          <span>View Details</span>
        </Link>
      </div>
    </article>
  );
};

export default memo(EventCard);
