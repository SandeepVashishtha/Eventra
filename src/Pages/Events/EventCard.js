import React, { memo, useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Clock,
  Gift,
  Heart,
  MapPin,
  Share2,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import { useMyEvents } from "../../context/MyEventsContext";
import {
  addBookmarkedEvent,
  isEventBookmarked,
  removeBookmarkedEvent,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";
import { getEventStatus } from "../../utils/eventUtils";
import { getSmartDateLabel } from "../../utils/relativeTime";
import { generateEventSharingData } from "../../utils/shareUtils";

const EventCard = ({ event }) => {
  const titleId = useId();
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
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

  const { isRegistered } = useMyEvents();
  const status = getEventStatus(event);

  useEffect(() => {
    setIsBookmarked(isEventBookmarked(event.id));

    return subscribeToBookmarkChanges(() => {
      setIsBookmarked(isEventBookmarked(event.id));
    });
  }, [event.id]);

  const eventSharingData = generateEventSharingData({
    ...event,
    title: event.title,
    description: event.description,
    date: event.date,
    id: event.id,
  });

  // Defensive date parsing: guard against missing or malformed dates
  const parsedDate = event && event.date ? new Date(event.date) : null;
  const hasValidDate = parsedDate instanceof Date && !isNaN(parsedDate.getTime());

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBookmarked) {
      removeBookmarkedEvent(event.id);
      toast.info("Removed from bookmarked events.", {
        autoClose: 1800,
      });
      return;
    }

    addBookmarkedEvent({
      ...event,
      status,
    });

    toast.success("Event bookmarked.", {
      autoClose: 1800,
    });
  };

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
      .catch(() => {
        toast.error("Could not copy link. Please try again.", {
          autoClose: 2500,
        });
      });
  };

  const isPastEvent = status === "past" || status === "ended";
  const registered = isRegistered(event.id);

  return (
    <article
      aria-labelledby={titleId}
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
    >
      <div className="p-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-950 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">
            {randomIcon}
            {event.category || "General"}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {hasValidDate ? getSmartDateLabel(parsedDate.toISOString()) : "Date TBA"}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 id={titleId} className="text-lg font-black text-slate-900 dark:text-slate-100">
              {event.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
              {event.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} className="text-indigo-500" />
            {hasValidDate ? parsedDate.toLocaleDateString() : "TBA"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} className="text-indigo-500" />
            {hasValidDate ? parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} className="text-indigo-500" />
            {event.location || "Online"}
          </span>
        </div>

        {registered && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
            <AlertTriangle size={12} />
            Registered
          </div>
        )}
      </div>

      <div className="px-5 pb-5 mt-auto flex flex-wrap gap-2">
        {isPastEvent ? (
          <div className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-3 text-sm font-semibold">
            Event Ended
          </div>
        ) : (
          <Link
            to={`/events/${event.id}/register`}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.03]"
          >
            Register Now
          </Link>
        )}

        <Link
          to={`/events/${event.id}`}
          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 px-4 py-3 text-sm font-semibold shadow-md"
        >
          View Details
        </Link>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
          className={`rounded-full p-2 shadow border ${
            isBookmarked
              ? "border-indigo-400 bg-indigo-600 text-white"
              : "border-gray-200 bg-white text-gray-600"
          }`}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </motion.button>

        <button
          type="button"
          onClick={handleCopyLink}
          aria-label={`Copy link for ${event.title}`}
          className="rounded-full p-2 shadow border border-gray-200 bg-white text-gray-600"
        >
          <Share2 size={14} />
        </button>
      </div>
    </article>
  );
};

export default memo(EventCard);
