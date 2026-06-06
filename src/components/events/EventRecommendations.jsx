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
      className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between animate-pulse select-none"
      style={{
        width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`,
        flexShrink: 0,
      }}
    >
      <div>
        {/* Shimmer Image Wrapper Layout */}
        <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-xl mb-4" />

        {/* Category & Status Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        {/* Event Title */}
        <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded-md mt-4" />

        {/* Description lines */}
        <div className="space-y-2 mt-3">
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        {/* Metadata Grid */}
        <div className="space-y-2.5 mt-5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer Divider */}
      <div className="mt-6 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="h-3 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
});

RecommendationSkeleton.displayName = "RecommendationSkeleton";

/**
 * 🖼️ SAFE FALLBACK IMAGE LAYOUT MODULE
 * Intercepts broken external URLs natively and updates sources to a fallback vector.
 */
const CardBannerImage = memo(({ src, alt }) => {
  const handleImageLoadingError = (e) => {
    e.target.onerror = null; // Prevent infinite fallback trigger loops
    e.target.src = INLINE_SVG_PLACEHOLDER;
    e.target.className =
      "h-full w-full object-cover opacity-60 filter grayscale dark:brightness-75";
  };

  return (
    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/20 shadow-inner group">
      <img
        src={src || INLINE_SVG_PLACEHOLDER}
        onError={handleImageLoadingError}
        alt={alt || "Event Banner Detail Showcase"}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute top-2 left-2 bg-slate-950/40 backdrop-blur-md p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <Layers className="w-3.5 h-3.5 text-white" />
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-md recommendations-skeleton-loading-view animate-pulse-subtle">
        {/* HEADER RIBBON SKELETON */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-64 bg-slate-100 dark:bg-slate-850 rounded-md mt-1.5" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 animate-pulse" />
            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>

        {/* LOADING SHIMMER MAPPING CONTAINER */}
        <div className="relative overflow-hidden w-full">
          <div className="flex gap-4 w-full">
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-md real-recommendations-carousel-block">
      {/* HEADER RENDERING CONTROLS */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
            <Sparkles className="w-5 h-5 fill-amber-500/20" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Personalized Recommendations
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Curated hackathons and events handpicked based on your category focus profile matrix.
            </p>
          </div>
        </div>

        {/* Action navigation toggle links */}
        {recommendedEvents.length > visibleCount && (
          <div className="flex items-center gap-1.5 navigation-buttons-row">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/20 transition-all active:scale-95"
              aria-label="Previous recommendation slide context"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/20 transition-all active:scale-95"
              aria-label="Next recommendation slide context"
            >
              <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
        )}
      </div>

      {/* HORIZONTAL CAROUSEL CARDS WRAPPER GRID */}
      <div className="relative overflow-hidden w-full content-slider-envelope-view">
        <div
          className="flex flex-nowrap transition-transform duration-500 ease-out gap-4 slider-film-strip-axis"
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
                className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300/40 dark:hover:border-slate-700/50 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-0.5"
                style={{
                  width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)`,
                  flexShrink: 0,
                }}
              >
                <div>
                  {/* INJECTED CARD BANNER: Implements robust a11y image onError error fallbacks */}
                  <CardBannerImage src={event.image || event.banner} alt={event.title} />

                  {/* Badge Row Overlay Elements */}
                  <div className="flex items-center justify-between gap-2 categories-meta-container">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/10">
                      {event.category || "General Context"}
                    </span>
                    {hasStrongMatchingScore && (
                      <span className="text-[9px] font-black uppercase tracking-wide text-amber-500 flex items-center gap-0.5 bg-amber-500/5 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        <Sparkles className="w-2.5 h-2.5 fill-amber-500/20 animate-spin-slow" />
                        Top Match
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 mt-3 line-clamp-1">
                    {event.title}
                  </h4>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                    {event.description ||
                      "No metadata description records mapped to this event instance outline."}
                  </p>

                  {/* Iconified Detail Logs */}
                  <div className="space-y-1.5 mt-4 visual-icon-specifications-grid">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{targetFormattedDateString}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {event.location || "Virtual / Remote Studio"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Link Elements Section */}
                <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between footer-actions-linkline">
                  <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {event.status || "Open"}
                  </span>
                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-black tracking-tight text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group/link"
                  >
                    View Details
                    <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5" />
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
