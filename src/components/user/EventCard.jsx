// src/components/user/EventCard.jsx
import { memo } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Tag,
  Ticket,
  Trash2,
  Activity,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "hooks/useReducedMotion";
import { useOfflineStatus } from "hooks/useOfflineStatus";
import StatusBadge from "../common/StatusBadge";
import LazyImage from "../common/LazyImage";

// Helper functions
const getEventStatus = (event) => {
  if (!event?.date) return "Unknown";
  const eventDate = new Date(event.date);
  const now = new Date();
  eventDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (eventDate < now) return "Completed";
  if (eventDate.getTime() === now.getTime()) return "Today";
  return "Upcoming";
};

const formatShortDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const fadeUp = (prefersReducedMotion) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: prefersReducedMotion ? 0 : i * 0.06,
      duration: prefersReducedMotion ? 0 : 0.4,
      ease: "easeOut",
    },
  }),
});

const EventCard = memo(({
  event,
  index,
  onRemoveRegistration,
  showCancel,
  onViewTicket,
  addToRecentEvents,
  onCopyLink,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isOffline = useOfflineStatus();
  const fadeUpVariants = fadeUp(prefersReducedMotion);
  const status = getEventStatus(event);
  const shortDate = formatShortDate(event?.date);

  // Render tags
  const renderTags = () => {
    if (!event?.tags?.length) return null;
    return (
      <div className="px-6 pb-3 flex flex-wrap gap-1.5">
        {event.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Render action buttons
  const renderActions = () => {
    if (showCancel) {
      return (
        <>
          <button
            className="group/btn w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold transition-all duration-300 hover:scale-105"
            onClick={() => onRemoveRegistration?.(event?.id || event?.eventId, event?.title)}
            disabled={isOffline}
          >
            <Trash2 size={13} /> Cancel Registration
          </button>
          <button
            className="group/btn w-full sm:flex-1"
            onClick={() => onViewTicket?.(event)}
          >
            <div className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-650 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full relative overflow-hidden cursor-pointer">
              <Ticket size={13} className="relative" />
              <span className="relative">Ticket</span>
            </div>
          </button>
        </>
      );
    }

    return (
      <button
        className="group/btn w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold transition-all duration-300 hover:scale-105"
        onClick={() => onCopyLink?.(event)}
      >
        <Copy size={13} /> Copy Link
      </button>
    );
  };

  return (
    <motion.div
      className="group relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-3xl shadow-xl flex flex-col overflow-hidden"
      custom={index}
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {event?.image && (
        <div className="relative h-48 overflow-hidden">
          <LazyImage
            src={event.image}
            alt={event.title}
            aspectRatio="16/9"
            className="w-full h-full"
            imgClassName="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      )}

      {event?.description && (
        <div className="px-6 py-4">
          <p className="text-sm line-clamp-2">{event.description}</p>
        </div>
      )}

      <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
        <div><MapPin size={14} /> {event?.location || "—"}</div>
        <div><Clock size={14} /> {event?.time || "—"}</div>
        <div><Tag size={14} /> {event?.type || "—"}</div>
        <div><Calendar size={14} /> {shortDate}</div>
      </div>

      <div className="px-6 py-2 flex justify-between">
        <span className="text-xs">{showCancel ? "Registered" : "Hosted"}</span>
        <StatusBadge status={status} />
      </div>

      {renderTags()}

      <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 bg-linear-to-r from-gray-50/30 to-white/60 dark:from-gray-800/30 dark:to-gray-900/60 border-t border-gray-200/60 dark:border-gray-700/50 mt-auto">
        {renderActions()}
        <Link
          to={`/events/${event?.id || event?.eventId}`}
          onClick={() => addToRecentEvents?.(event)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm font-bold transition-all duration-300 hover:scale-105"
        >
          <Activity size={13} /> View Details
        </Link>
      </div>

      <span className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs px-3 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
        View Event Details
      </span>
    </motion.div>
  );
});

EventCard.displayName = "EventCard";

export default EventCard;
