import useToast from "hooks/useToast";
import React, { memo, useCallback, useId, useState } from "react";
import { logger } from "utils/logger";
import LazyImage from "components/common/LazyImage";
import { formatLocalDateTime } from "utils/localDateTime";
import ShareModal from "components/common/ShareModal";
import StatusBadge from "components/common/StatusBadge";
import { getEventStatus, getFomoStatus } from "utils/eventUtils";
import SocialShareButtons from "components/common/SocialShareButtons";
import AddToCalendar from "components/common/AddToCalendar";
import { useMyEvents } from "context/MyEventsContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { BookmarkCheck, Bookmark, MapPin, Calendar, Clock, ArrowRight, Columns2 } from "lucide-react";
import { categories, getCategoryByValue } from "constants/eventDefaults";

import { isEventBookmarked, addBookmarkedEvent, removeBookmarkedEvent } from "utils/bookmarkUtils";
import SeatsRemaining from "components/common/SeatsRemaining";
import SellingFastBadge from "components/common/SellingFastBadge";
import useEventAvailability from "hooks/useEventAvailability";

const EventCard = ({ event, position, isHighlighted = false, onCompare, isSelected = false }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const [imageFailed, setImageFailed] = useState(false);
  const titleId = useId();
  const { isRegistered } = useMyEvents();
  const { success, info } = useToast();

  // Live, real-time seat availability for this event. Subscribes to the shared
  // SSE stream and falls back to polling so seat counters stay fresh without a
  // full page reload.
  const { availability } = useEventAvailability(event.id, {
    enabled: event.capacity != null && event.capacity > 0,
  });

  const isUserRegistered = isRegistered(event.id);
  const computedStatus = getEventStatus(event);

  // Calculate FOMO status for low inventory
  const capacity = availability?.capacity ?? event.capacity;
  const registeredCount = availability?.registeredCount ?? event.registeredCount ?? event.attendees?.length ?? 0;
  const { isLowInventory, message: fomoMessage } = getFomoStatus(capacity, registeredCount);

  const eventImage = event.image || event.imageUrl || null;
  const eventDate = event.date || event.eventDate || event.startDate || null;

  const dateInfo = formatLocalDateTime(eventDate);

  const handleBookmarkToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isBookmarked) {
        removeBookmarkedEvent(event.id);
        setIsBookmarked(false);
        toast.info("Removed from saved events.", {
          toastId: `bookmark-${event.id}`,
          autoClose: 1800,
        });
      } else {
        addBookmarkedEvent({ ...event, status: computedStatus });
        setIsBookmarked(true);
        success("Event saved!", { toastId: `bookmark-${event.id}` });
      }
    },
    [isBookmarked, event, computedStatus]
  );

  return (
    <motion.article
      aria-labelledby={titleId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-card-bg border border-border hover:border-primary shadow-premium-sm hover:shadow-premium-md transition-all duration-300 ${
        isSelected ? "ring-2 ring-indigo-500 border-indigo-500" : ""
      }`}
    >
      {/* Banner / Cover image */}
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        {eventImage && !imageFailed ? (
          <LazyImage
            src={eventImage}
            alt={event.title ? `${event.title} event cover` : "Event cover image"}
            className="absolute inset-0 w-full h-full"
            imgClassName="object-cover w-full h-full opacity-90 group-hover:scale-102 transition-transform duration-700"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-primary/10 select-none">Eventra</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Overlay badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {/* Color-coded category badges */}
          {event.categories && Array.isArray(event.categories) && event.categories.length > 0 ? (
            event.categories.slice(0, 3).map((catValue) => {
              const category = getCategoryByValue(catValue);
              return category ? (
                <span
                  key={catValue}
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-md ${category.color}`}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  {category.label}
                </span>
              ) : null;
            })
          ) : (
            // Fallback for backward compatibility - single category
            (event.category || event.type) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/10">
                {event.category || event.type}
              </span>
            )
          )}
          {isUserRegistered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white shadow-md">
              Registered
            </span>
          )}
          {isLowInventory && fomoMessage && (
            <SellingFastBadge message={fomoMessage} />
          )}
        </div>

        {/* Save Toggle button */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleBookmarkToggle}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
            aria-pressed={isBookmarked}
            className={`rounded-lg p-2 backdrop-blur-md border transition-all duration-200 ${
              isBookmarked
                ? "bg-primary text-white border-primary/20"
                : "bg-black/40 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>

          {onCompare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompare(event);
              }}
              aria-label={isSelected ? "Remove from comparison" : "Add to comparison"}
              aria-pressed={isSelected}
              title={isSelected ? "Remove from comparison" : "Compare this event"}
              className={`rounded-lg p-2 backdrop-blur-md border transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-400/40"
                  : "bg-black/40 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Columns2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3
          id={titleId}
          className="text-text font-bold text-lg sm:text-xl leading-snug mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2 break-words min-w-0"
        >
          <Link to={`/events/${event.id}`} title={event.title}>{event.title}</Link>
        </h3>

        <p className="text-text-light text-sm font-normal leading-relaxed mb-6 line-clamp-2">
          {event.description}
        </p>

        {Array.isArray(event.tags) && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Live seat availability indicator */}
        {event.capacity != null && event.capacity > 0 && (
          <SeatsRemaining
            capacity={availability?.capacity ?? event.capacity}
            registered={
              availability?.registeredCount ?? event.registeredCount ?? event.attendees?.length ?? 0
            }
            compact
            className="mb-4"
          />
        )}

        <div className="flex flex-col gap-2 mt-auto border-t border-border pt-4 text-xs font-semibold text-text-light">
          {event.location && (
            <div className="flex items-center gap-2 truncate">
              <MapPin size={14} className="text-text-light/50 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 truncate">
            <Calendar size={14} className="text-text-light/50 shrink-0" />
            <span>{dateInfo.date}</span>

            {dateInfo.time && dateInfo.date !== "Date TBD" && (
              <>
                <span className="text-border">|</span>
                <Clock size={12} className="text-text-light/40 shrink-0" />
                <span>{dateInfo.time}</span>

                <span className="text-xs text-text-light">({dateInfo.timezone})</span>
              </>
            )}
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-6 inline-flex items-center justify-center gap-1 w-full px-4 py-2.5 rounded-lg bg-text text-bg hover:opacity-90 text-sm font-semibold transition-all duration-200"
        >
          View Details
          <ArrowRight
            size={14}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </motion.article>
  );
};

export default memo(EventCard);
