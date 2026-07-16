import React, { memo, useCallback, useId, useState } from "react";
import { logger } from "utils/logger";
import LazyImage from "components/common/LazyImage";
import ShareModal from "components/common/ShareModal";
import StatusBadge from "components/common/StatusBadge";
import { getEventStatus } from "utils/eventUtils";
import SocialShareButtons from "components/common/SocialShareButtons";
import AddToCalendar from "components/common/AddToCalendar";
import { useMyEvents } from "context/MyEventsContext";
import MatchScoreBadge from "components/common/MatchScoreBadge";

import {
  isEventBookmarked,
  addBookmarkedEvent,
  removeBookmarkedEvent,
} from "utils/bookmarkUtils";
import { checkRegistrationConflict } from "utils/conflictDetection";

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
    relative = `In ${Math.round(diffDays / 7)} w`;
  } else {
    relative = `In ${Math.round(diffDays / 30)} m`;
  }

  const short = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const full = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return { short, full, relative, time };
};

const EventCard = ({ event }) => {
  const [isBookmarked, setIsBookmarked] = useState(() => isEventBookmarked(event.id));
  const [imageFailed, setImageFailed] = useState(false);
  const titleId = useId();
  const { isRegistered } = useMyEvents();

  const isUserRegistered = isRegistered(event.id);
  const computedStatus = getEventStatus(event);

  const eventImage = event.image || event.imageUrl || null;
  const eventDate = event.date || event.eventDate || event.startDate || null;
  const dateInfo = formatEventDate(eventDate);

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-card-bg border border-border hover:border-primary shadow-premium-sm hover:shadow-premium-md transition-all duration-300"
    >
      {/* Banner / Cover image */}
      <div className="relative h-48 overflow-hidden bg-bg-secondary">
        {eventImage && !imageFailed ? (
          <LazyImage
            src={eventImage}
            alt=""
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
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/10">
            {event.type || event.category || "Event"}
          </span>
          {isUserRegistered && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white shadow-md">
              Registered
            </span>
          )}
        </div>

        {/* Save Toggle button */}
        <button
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark event"}
          aria-pressed={isBookmarked}
          className={`absolute top-4 right-4 rounded-lg p-2 backdrop-blur-md border transition-all duration-200 ${
            isBookmarked
              ? "bg-primary text-white border-primary/20"
              : "bg-black/40 border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
      </div>

      {/* Info Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3
          id={titleId}
          className="text-text font-bold text-lg sm:text-xl leading-snug mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2"
        >
          <Link to={`/events/${event.id}`}>
            {event.title}
          </Link>
        </h3>

        <p className="text-text-light text-sm font-normal leading-relaxed mb-6 line-clamp-2">
          {event.description}
        </p>

        <div className="flex flex-col gap-2 mt-auto border-t border-border pt-4 text-xs font-semibold text-text-light">
          {event.location && (
            <div className="flex items-center gap-2 truncate">
              <MapPin size={14} className="text-text-light/50 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 truncate">
            <Calendar size={14} className="text-text-light/50 shrink-0" />
            <span>{dateInfo.full}</span>
            {dateInfo.time && dateInfo.full !== "Date TBD" && (
              <>
                <span className="text-border">|</span>
                <Clock size={12} className="text-text-light/40 shrink-0" />
                <span>{dateInfo.time}</span>
              </>
            )}
          </div>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-6 inline-flex items-center justify-center gap-1 w-full px-4 py-2.5 rounded-lg bg-text text-bg hover:opacity-90 text-sm font-semibold transition-all duration-200"
        >
          View Details
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.article>
  );
};

export default memo(EventCard);
