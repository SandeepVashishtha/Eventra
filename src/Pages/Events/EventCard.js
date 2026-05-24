import { useEffect, useState, memo } from "react";
import {
  formatEventDateTime,
  getUserTimezone,
} from "../../utils/timezoneUtils";
import { Link } from "react-router-dom";
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
import {
  addBookmarkedEvent,
  isEventBookmarked,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";

const EventCard = ({ event }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const { isRegistered } = useMyEvents();
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

  const eventDateTime = new Date(`${event.date} ${event.time}`);
  const isPastEvent = eventDateTime < new Date();

  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id,
  });

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
        console.error("Failed to copy: ", err);
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

  const handleBookmarkToggle = (e) => {
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
  };

  return (
    <div
      data-aos="zoom-in"
      data-aos-duration="800"
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 flex flex-col z-10 hover:z-50 hover:shadow-2xl hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700"
    >
      {/* Action buttons */}
      <div className="absolute top-[5.5rem] right-3 z-[200] flex space-x-1.5">
        <button
          type="button"
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Remove event bookmark" : "Bookmark event"}
          aria-pressed={isBookmarked}
          title={isBookmarked ? "Remove bookmark" : "Bookmark event"}
          className={`bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border transition-all duration-200 ${
            isBookmarked
              ? "border-indigo-200 text-indigo-600 bg-indigo-50/95"
              : "border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200"
          }`}
        >
          {isBookmarked ? (
            <BookmarkCheck size={14} fill="currentColor" />
          ) : (
            <Bookmark size={14} />
          )}
        </button>

        <ShareMenu
          shareData={eventSharingData}
          position="above"
          menuClassName="!z-[999] shadow-2xl"
          buttonClassName=""
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200 group/share">
            <Share2 size={14} className="text-gray-600" />
          </div>
        </ShareMenu>

        <div
          onClick={handleCopyLink}
          className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200 group/copy relative"
          title="Copy Event Link"
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
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </div>

        <a
          href={addEventToGoogleCalendar(event)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Add to Google Calendar"
          className="group/cal"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow cursor-pointer hover:shadow-md border border-gray-200">
            <Calendar size={14} className="text-gray-600" />
          </div>
        </a>
      </div>

      {/* Header */}
      <div className="flex items-center px-5 py-4 gap-4 bg-gradient-to-r from-white/80 to-indigo-50/60 dark:from-gray-900/80 dark:to-indigo-950/60 border-b border-gray-100 dark:border-gray-800">
        <div className="p-2 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-inner flex-shrink-0">
          {randomIcon}
        </div>

        <h3 className="text-gray-900 dark:text-white font-bold text-lg tracking-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 flex-1">
          {event.title}
        </h3>
        <div className="ml-auto">
          <StatusBadge status={computedStatus} />
        </div>
      </div>

      {/* Image */}
<div className="relative h-40 overflow-hidden">
        <img
          loading="lazy"
          decoding="async"
          src={event.image}
          alt={event.title}
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
     {/* Info Grid */}
<div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-gray-600 dark:text-gray-400 text-sm bg-gray-50/50 dark:bg-gray-800/30">

  {/* Location */}
  <div className="flex items-center gap-2">
    <MapPin
      size={14}
      className="text-pink-500 flex-shrink-0"
    />

    <span className="truncate">
      {event.location}
    </span>
  </div>

  {/* Local Time */}
  <div className="flex items-start gap-2">
    <Clock
      size={14}
      className="text-blue-500 flex-shrink-0 mt-0.5"
    />

    <div className="flex flex-col">
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {formatEventDateTime(
          `${event.date}T${event.time}`
        )}
      </span>

      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {getUserTimezone()}
      </span>
    </div>
  </div>

  {/* Event Type */}
  <div className="flex items-center gap-2">
    <Tag
      size={14}
      className="text-green-500 flex-shrink-0"
    />

    <span className="truncate">
      {event.type}
    </span>
  </div>

  {/* Event Date */}
  <div className="flex items-start gap-2">
    <Calendar
      size={14}
      className="text-indigo-500 flex-shrink-0 mt-0.5"
    />

    <div className="flex flex-col">
      <span className="truncate">
        {new Date(event.date).toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )}
      </span>

      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        Localized Event Time
      </span>
    </div>
  </div>
</div>
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <ReminderControls event={event} canSetReminder={canSetReminder} compact />
      </div>
      {/* Seats / Capacity */}
      {typeof event.maxAttendees === "number" && event.maxAttendees > 0 && (() => {
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

        return (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Seats
              </span>
              {isFull ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  Full
                </span>
              ) : (
                <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
                  {spotsLeft} spot{spotsLeft === 1 ? "" : "s"} left
                </span>
              )}
            </div>
            <div
              className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
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
            <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-500 tabular-nums">
              {registered} / {capacity} registered
            </div>
          </div>
        );
      })()}

      {/* CTA */}
      <div className="px-5 py-4 flex gap-3 mt-auto">
        {isPastEvent ? (
          <div className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-3 text-sm font-semibold shadow-md cursor-not-allowed">
            Event Ended
          </div>
        ) : (
          <Link to={`/events/${event.id}/register`} className="flex-1">
            <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:via-indigo-600 hover:to-slate-800 text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300 w-full hover:scale-[1.03] hover:shadow-xl">
              Register Now
            </div>
          </Link>
        )}

        <Link to={`/events/${event.id}`} className="flex-1">
          <div className="inline-flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 px-4 py-3 text-sm font-semibold shadow-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-800 dark:hover:text-white hover:scale-[1.03] hover:shadow-lg transition-all duration-300 w-full">
            View Details
          </div>
        </Link>
      </div>
    </div>
  );
};

export default memo(EventCard);
