/**
 * @fileoverview SimilarEvents — "Find Similar Events" recommendation section (#7754)
 *
 * Renders a horizontally scrollable grid of events that are similar to the
 * currently viewed event, scored by a multi-signal cosine-style algorithm:
 *
 *   Signal            Weight
 *   ─────────────────────────
 *   Same category     40 pts   (strongest signal — matches the primary topic)
 *   Shared tags       up to 30 pts (5 pts per shared tag, capped)
 *   Same type         15 pts   (conference/hackathon/workshop/…)
 *   Same eventMode    10 pts   (online / in-person)
 *   Same difficulty    5 pts   (when present)
 *
 * Events with a combined score of 0 are excluded. Results are capped at 6
 * cards and sorted by score descending so the best matches come first.
 *
 * @module components/events/SimilarEvents
 */

import { useMemo, useRef, useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import mockEvents from "../../Pages/Events/eventsMockData.json";
import LazyImage from "../common/LazyImage";

// ─── Scoring weights ─────────────────────────────────────────────────────────

const W_CATEGORY = 40;
const W_TAG = 5;         // per shared tag
const W_TAG_MAX = 30;    // cap at 6 shared tags
const W_TYPE = 15;
const W_MODE = 10;
const W_DIFFICULTY = 5;

const MAX_RESULTS = 6;

// ─── Similarity engine ───────────────────────────────────────────────────────

/**
 * Compute a similarity score (0–100) between the current event and a candidate.
 *
 * @param {object} current   - The event the user is currently viewing
 * @param {object} candidate - A candidate event from the pool
 * @returns {number} 0–100 similarity score
 */
const computeSimilarityScore = (current, candidate) => {
  let score = 0;

  // Category match
  if (
    current.category &&
    candidate.category &&
    current.category.toLowerCase() === candidate.category.toLowerCase()
  ) {
    score += W_CATEGORY;
  }

  // Shared tags
  const currentTags = (current.tags || []).map((t) => t.toLowerCase());
  const candidateTags = (candidate.tags || []).map((t) => t.toLowerCase());
  if (currentTags.length && candidateTags.length) {
    const sharedCount = currentTags.filter((t) => candidateTags.includes(t)).length;
    score += Math.min(sharedCount * W_TAG, W_TAG_MAX);
  }

  // Same event type
  if (
    current.type &&
    candidate.type &&
    current.type.toLowerCase() === candidate.type.toLowerCase()
  ) {
    score += W_TYPE;
  }

  // Same event mode (online / in-person / hybrid)
  if (
    current.eventMode &&
    candidate.eventMode &&
    current.eventMode.toLowerCase() === candidate.eventMode.toLowerCase()
  ) {
    score += W_MODE;
  }

  // Same difficulty level
  if (
    current.difficulty &&
    candidate.difficulty &&
    current.difficulty.toLowerCase() === candidate.difficulty.toLowerCase()
  ) {
    score += W_DIFFICULTY;
  }

  return score;
};

/**
 * Find the top similar events for the given event.
 *
 * @param {object}   currentEvent  - The event the user is viewing
 * @param {object[]} allEvents     - Full pool of events
 * @param {number}   [limit=6]    - Maximum number of results
 * @returns {{ event: object, score: number }[]}
 */
const findSimilarEvents = (currentEvent, allEvents, limit = MAX_RESULTS) => {
  return allEvents
    .filter((e) => String(e.id) !== String(currentEvent.id))
    .map((e) => ({ event: e, score: computeSimilarityScore(currentEvent, e) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// ─── Similarity reason label ──────────────────────────────────────────────────

/**
 * Build a short human-readable reason string for why an event was matched.
 * E.g. "Same category · 2 shared tags"
 */
const buildMatchReason = (current, candidate) => {
  const parts = [];

  if (
    current.category &&
    candidate.category &&
    current.category.toLowerCase() === candidate.category.toLowerCase()
  ) {
    parts.push("Same category");
  }

  const currentTags = (current.tags || []).map((t) => t.toLowerCase());
  const candidateTags = (candidate.tags || []).map((t) => t.toLowerCase());
  const sharedCount = currentTags.filter((t) => candidateTags.includes(t)).length;
  if (sharedCount > 0) {
    parts.push(`${sharedCount} shared tag${sharedCount > 1 ? "s" : ""}`);
  }

  if (
    current.type &&
    candidate.type &&
    current.type.toLowerCase() === candidate.type.toLowerCase()
  ) {
    parts.push(`Same type`);
  }

  return parts.length > 0 ? parts.join(" · ") : "Related event";
};

// ─── Type color map ───────────────────────────────────────────────────────────

const TYPE_STYLE = {
  hackathon:   "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  conference:  "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  workshop:    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  summit:      "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  networking:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  bootcamp:    "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
};

const getTypeStyle = (type = "") =>
  TYPE_STYLE[type.toLowerCase()] ||
  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SimilarEventSkeleton = memo(() => (
  <div className="flex-shrink-0 w-72 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden animate-pulse">
    <div className="h-36 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
));
SimilarEventSkeleton.displayName = "SimilarEventSkeleton";

// ─── Event card ───────────────────────────────────────────────────────────────

const SimilarEventCard = memo(({ event, score, matchReason }) => {
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const spotsLeft =
    event.maxAttendees && event.attendees != null
      ? event.maxAttendees - event.attendees
      : null;

  const scorePercent = Math.min(100, Math.round(score));

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex-shrink-0 w-72 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      aria-label={`View similar event: ${event.title}`}
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <LazyImage
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Type badge overlay */}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${getTypeStyle(event.type)}`}
        >
          {event.type}
        </span>
        {/* Score pill */}
        <span
          className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-gray-900/90 text-indigo-700 dark:text-indigo-300 shadow-sm"
          title={`Similarity score: ${scorePercent}%`}
        >
          {scorePercent}% match
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2">
        {/* Category */}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 truncate">
          {event.category}
        </p>

        {/* Title */}
        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {event.title}
        </h4>

        {/* Meta */}
        <div className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-gray-400">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} className="shrink-0 text-gray-400" />
              {formattedDate}
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1 truncate">
              <MapPin size={11} className="shrink-0 text-gray-400" />
              {event.location}
            </span>
          )}
          {spotsLeft !== null && spotsLeft >= 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} className="shrink-0 text-gray-400" />
              {spotsLeft === 0 ? "Full" : `${spotsLeft} spots left`}
            </span>
          )}
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-medium rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Match reason */}
        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 italic mt-1 truncate">
          {matchReason}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1 group-hover:gap-2 transition-all">
          View Event <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
});
SimilarEventCard.displayName = "SimilarEventCard";

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.currentEvent - The full event object currently being viewed
 */
const SimilarEvents = ({ currentEvent }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const similar = useMemo(
    () => findSimilarEvents(currentEvent, mockEvents),
    [currentEvent]
  );

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  const scroll = useCallback(
    (direction) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollBy({ left: direction === "left" ? -304 : 304, behavior: "smooth" });
      setTimeout(updateScrollState, 350);
    },
    [updateScrollState]
  );

  if (!currentEvent || similar.length === 0) return null;

  return (
    <section
      aria-label="Similar events you might enjoy"
      className="mt-14 mb-4"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
            <Layers size={16} className="text-indigo-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Similar Events
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Based on category, tags, and type
            </p>
          </div>
        </div>

        {/* Scroll controls */}
        {similar.length > 3 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll similar events left"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll similar events right"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Cards scroll track */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {similar.map(({ event, score }) => (
          <div key={event.id} className="snap-start">
            <SimilarEventCard
              event={event}
              score={score}
              matchReason={buildMatchReason(currentEvent, event)}
            />
          </div>
        ))}
      </div>

      {/* Hide native scrollbar in Webkit */}
      <style>{`
        section[aria-label="Similar events you might enjoy"] div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default memo(SimilarEvents);
