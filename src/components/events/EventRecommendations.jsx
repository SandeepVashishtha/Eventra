import { useState, useEffect, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  ArrowRight,
  Layers,
  Clock,
} from "lucide-react";
import mockEvents from "../../Pages/Events/eventsMockData.json";
import { syncSecureStorage } from "../../utils/secureStorage";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { getRecommendedEvents } from "../../utils/eventRecommendationUtils";

// =========================================================================
// INLINE VECTOR GRAPHIC CONSTANTS (FALLBACK PLACEHOLDER IMAGES)
// =========================================================================
/**
 * Secure base64 dynamic inline vector SVG string.
 * Used to immediately resolve broken image handles with zero external network overhead.
 */
const INLINE_SVG_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='100%' height='100%' fill='%231e293b'/><circle cx='200' cy='100' r='40' fill='%23334155'/><path d='M180 110 L200 90 L220 110' stroke='%23475569' stroke-width='4' fill='none'/></svg>";

// =========================================================================
// SUB-COMPONENTS FOR EXTENDED LAYOUT QUALITY
// =========================================================================
/**
 * 💀 SHIMMER SKELETON CARD MODULE
 * Matches the newly padded structural card dimensions precisely to eliminate layout shifting.
 */
const RecommendationSkeleton = memo(({ visibleCount = 3 }) => {
  return (
    <div
      className="border-slate-150 flex animate-pulse flex-col justify-between rounded-2xl border bg-slate-50 p-5 shadow-sm select-none dark:border-slate-800/80 dark:bg-slate-950"
      style={{
        width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`,
        flexShrink: 0,
      }}
    >
      <div>
        {/* Shimmer Image Wrapper Layout */}
        <div className="mb-4 h-32 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />

        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-14 rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Event Title */}
        <div className="mt-4 h-4 w-4/5 rounded-md bg-slate-200 dark:bg-slate-800" />

        {/* Description lines */}
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-5/6 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Metadata Grid */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-24 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Footer Divider */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
        <div className="h-3 w-12 rounded-md bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
});

RecommendationSkeleton.displayName = "RecommendationSkeleton";

/**
 * 🖼️ SAFE FALLBACK IMAGE LAYOUT MODULE
 * Intercepts broken external URLs natively and updates sources to a fallback vector.
 */
const handleImageLoadingError = (e) => {
  e.target.onerror = null;
  e.target.src = INLINE_SVG_PLACEHOLDER;
  e.target.className =
    "h-full w-full object-cover opacity-60 filter grayscale dark:brightness-75";
};

const CardBannerImage = memo(({ src, alt }) => {
  return (
    <div className="group relative mb-3.5 h-32 w-full overflow-hidden rounded-xl border border-slate-200/20 bg-slate-100 shadow-inner dark:bg-slate-900">
      <img
        src={src || INLINE_SVG_PLACEHOLDER}
        onError={handleImageLoadingError}
        alt={alt || "Event Banner Detail Showcase"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="pointer-events-none absolute top-2 left-2 rounded-lg bg-slate-950/40 p-1.5 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
        <Layers className="h-3.5 w-3.5 text-white" />
      </div>
    </div>
  );
});

CardBannerImage.displayName = "CardBannerImage";

// =========================================================================
// MAIN PERSONALIZED RECOMMENDATIONS SECTION
// =========================================================================
const EventRecommendations = ({ currentEventId, currentCategory }) => {
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  // Dynamic visible count calculation based on viewport width
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCount(1);
      } else if (width < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clamp currentIndex when visibleCount or recommendedEvents changes
  useEffect(() => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, recommendedEvents.length - visibleCount);
      return Math.min(prev, maxIndex);
    });
  }, [visibleCount, recommendedEvents.length]);

  // Core processing effect tracing profile parameters
  useEffect(() => {
    setLoading(true);
    let active = true;

    const loadRecommendations = async () => {
      let userInterests = ["Coding", "Tech", "AI", "Development"];

      // Sync and extract client custom telemetry interests log from localStorage safely
      try {
        const storedUser = await syncSecureStorage.getItemAsync("user");
        if (storedUser) {
          const parsed = safeJsonParse(storedUser, null);
          if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
            userInterests = parsed.skills;
          }
        }
      } catch (error) {
        console.error("Failsafe tracking intercept: secureStorage parsing collapsed safely.", error);
      }

      if (!active) return;

      const validMockEvents = Array.isArray(mockEvents) ? mockEvents : [];
      const recommendations = getRecommendedEvents({
        events: validMockEvents,
        currentEventId,
        currentCategory,
        userInterests,
      });

      if (active) {
        setRecommendedEvents(recommendations);
        setCurrentIndex(0);
        setLoading(false);
      }
    };

    const computationalTimer = setTimeout(() => {
      loadRecommendations();
    }, 800);

    return () => {
      active = false;
      clearTimeout(computationalTimer);
    };
  }, [currentEventId, currentCategory]);

  // Carousel slider boundary movement methods
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev + 1 >= recommendedEvents.length - (visibleCount - 1) ? 0 : prev + 1
    );
  }, [recommendedEvents.length, visibleCount]);

  // Prevent sliding back if recommendedEvents is smaller than visibleCount
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, recommendedEvents.length - visibleCount) : prev - 1
    );
  }, [recommendedEvents.length, visibleCount]);

  // Handle loading interface states
  if (loading) {
    return (
      <div className="recommendations-skeleton-loading-view animate-pulse-subtle rounded-3xl border border-slate-200 bg-white p-6 shadow-md md:p-8 dark:border-slate-800/80 dark:bg-slate-900">
        {/* HEADER RIBBON SKELETON */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
              <Sparkles className="h-5 w-5 fill-amber-500/20" />
            </div>
            <div>
              <div className="h-5 w-48 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="dark:bg-slate-850 mt-1.5 h-3 w-64 rounded-md bg-slate-100" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="h-8 w-8 animate-pulse rounded-xl bg-slate-50 dark:bg-slate-800" />
            <div className="h-8 w-8 animate-pulse rounded-xl bg-slate-50 dark:bg-slate-800" />
          </div>
        </div>

        {/* LOADING SHIMMER MAPPING CONTAINER */}
        <div className="relative w-full overflow-hidden">
          <div className="flex w-full gap-4">
            {Array.from({ length: visibleCount }).map((_, idx) => (
              <RecommendationSkeleton key={idx} visibleCount={visibleCount} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendedEvents.length === 0) return null;

  return (
    <div className="real-recommendations-carousel-block rounded-3xl border border-slate-200 bg-white p-6 shadow-md md:p-8 dark:border-slate-800/80 dark:bg-slate-900">
      {/* HEADER RENDERING CONTROLS */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500 shadow-sm">
            <Sparkles className="h-5 w-5 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Personalized Recommendations
            </h3>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Curated hackathons and events handpicked based on your category focus profile matrix.
            </p>
          </div>
        </div>

        {/* Action navigation toggle links */}
        {recommendedEvents.length > visibleCount && (
          <div className="navigation-buttons-row flex items-center gap-1.5">
            <button
              onClick={prevSlide}
              className="rounded-xl border border-slate-200/20 bg-slate-50 p-2 transition-all hover:bg-slate-100 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label="Previous recommendation slide context"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={nextSlide}
              className="rounded-xl border border-slate-200/20 bg-slate-50 p-2 transition-all hover:bg-slate-100 active:scale-95 dark:bg-slate-800 dark:hover:bg-slate-700"
              aria-label="Next recommendation slide context"
            >
              <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        )}
      </div>

      {/* HORIZONTAL CAROUSEL CARDS WRAPPER GRID */}
      <div className="content-slider-envelope-view relative w-full overflow-hidden">
        <div
          className="slider-film-strip-axis flex flex-nowrap gap-4 transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(-${currentIndex} * (100% + 16px) / ${visibleCount}))`,
          }}
        >
          {recommendedEvents.map((event) => {
            if (!event) return null;
            const hasStrongMatchingScore = event.recommendationScore > 10;
            const targetFormattedDateString = event.date
              ? new Date(event.date.replace(/-/g, "/")).toLocaleDateString()
              : "Upcoming";

            return (
              <div
                key={event.id}
                className="border-slate-150 flex transform flex-col justify-between rounded-2xl border bg-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300/40 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-950 dark:hover:border-slate-700/50"
                style={{
                  width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`,
                  flexShrink: 0,
                }}
              >
                <div>
                  {/* INJECTED CARD BANNER: Implements robust a11y image onError error fallbacks */}
                  <CardBannerImage src={event.image || event.banner} alt={event.title} />

                  {/* Badge Row Overlay Elements */}
                  <div className="categories-meta-container flex items-center justify-between gap-2">
                    <span className="rounded-md border border-indigo-200/10 bg-indigo-100 px-2 py-0.5 text-[9px] font-black tracking-wider text-indigo-700 uppercase dark:bg-indigo-950 dark:text-indigo-300">
                      {event.category || "General Context"}
                    </span>
                    {hasStrongMatchingScore && (
                      <span className="flex items-center gap-0.5 rounded border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-amber-500 uppercase dark:bg-amber-500/10">
                        <Sparkles className="animate-spin-slow h-2.5 w-2.5 fill-amber-500/20" />
                        Top Match
                      </span>
                    )}
                  </div>

                  <h4 title={event.title} className="mt-3 line-clamp-2 min-w-0 text-sm font-extrabold tracking-tight break-words text-slate-900 dark:text-slate-100">
                    {event.title}
                  </h4>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed font-medium text-slate-400 dark:text-slate-500">
                    {event.description ||
                      "No metadata description records mapped to this event instance outline."}
                  </p>

                  {/* Iconified Detail Logs */}
                  <div className="visual-icon-specifications-grid mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span>{targetFormattedDateString}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span className="truncate">
                        {event.location || "Virtual / Remote Studio"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link Elements Section */}
                <div className="footer-actions-linkline mt-5 flex items-center justify-between border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
                  <span className="flex items-center gap-1 text-[10px] font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">
                    <Clock className="h-2.5 w-2.5" />
                    {event.status || "Open"}
                  </span>
                  <Link
                    to={`/events/${event.id}`}
                    className="group/link inline-flex items-center gap-1 text-[11px] font-black tracking-tight text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View Details
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default memo(EventRecommendations);
