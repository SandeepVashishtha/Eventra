import { useMemo, useState, useEffect } from "react";
import {
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  FilterX,
} from "lucide-react";
import { showSuccessToast } from "../../utils/toast";
import { generateAIInsights } from "../../services/aiRecommendationService";
import EmptyState from "../../components/common/EmptyState";

import { getUserProfile } from "../../utils/userProfileAnalyzer";
import {
  buildPersonalizedRecommendations,
  getTrendingEventsForArea,
} from "../../utils/recommendationEngine";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import useBookmarks from "../../hooks/useBookmarks";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import { getBookmarkedEvents, subscribeToBookmarkChanges } from "../../utils/bookmarkUtils";
import mockEvents from "../Events/eventsMockData.json";
import { EventCardSkeleton, SkeletonBlock } from "../../components/common/SkeletonLoaders";

const EventRecommendation = () => {
  const { user } = useAuth();
  const { myEvents, addRegistration } = useMyEvents();
  const { bookmarks } = useBookmarks(user?.id || user?.email || "guest");
  const { recentlyViewed } = useRecentlyViewed();
  const [globalBookmarks, setGlobalBookmarks] = useState(() => getBookmarkedEvents());

  const events = useMemo(
    () =>
      mockEvents.map((event) => ({
        ...event,
        level:
          event.level ||
          (event.price === 0 ? "Beginner" : event.price > 500 ? "Advanced" : "Intermediate"),
        tag: event.tags?.[0] || event.category,
      })),
    []
  );

  const [interest, setInterest] = useState("");
  const [level, setLevel] = useState("");
  const [eventType, setEventType] = useState("");
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOtherEvents, setShowOtherEvents] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Match Priority Weights
  const [interestWeight, setInterestWeight] = useState(40);
  const [levelWeight, setLevelWeight] = useState(30);
  const [typeWeight, setTypeWeight] = useState(30);

  // Selected Event Modal State
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [aiInsights, setAiInsights] = useState("");

  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => subscribeToBookmarkChanges(setGlobalBookmarks), []);

  useEffect(() => {
    const loadInsights = async () => {
      if (!selectedEvent) return;

      setInsightLoading(true);

      const profile = getUserProfile();

      const insights = await generateAIInsights(selectedEvent, profile);

      setAiInsights(insights);

      setInsightLoading(false);
    };

    loadInsights();
  }, [selectedEvent]);

  const userProfile = useMemo(() => getUserProfile(), []);
  const preferredLocation = useMemo(() => {
    const sources = [...myEvents, ...bookmarks, ...globalBookmarks, ...recentlyViewed]
      .map((entry) => entry?.event?.location || entry?.eventSummary?.location || entry?.location)
      .filter((locationValue) => locationValue && locationValue !== "Online");

    return sources[0] || user?.location || "";
  }, [bookmarks, globalBookmarks, myEvents, recentlyViewed, user]);

  const trendingNearby = useMemo(
    () => getTrendingEventsForArea(events, preferredLocation, 4),
    [events, preferredLocation]
  );

  const generateRecommendations = () => {
    setHasSearched(true);
    setLoading(true);
    setShowOtherEvents(false);

    // Track execution for onboarding checklist
    localStorage.setItem("eventra_ai_recommendation_generated", "true");

    setTimeout(() => {
      const selectedProfile = {
        ...userProfile,
        interests: [...(userProfile.interests || []), interest].filter(Boolean),
        eventTypes: [...(userProfile.eventTypes || []), eventType].filter(Boolean),
        level: level || userProfile.level,
      };

      const recommendations = buildPersonalizedRecommendations({
        events,
        userProfile: selectedProfile,
        registeredEvents: myEvents,
        bookmarkedEvents: [...bookmarks, ...globalBookmarks],
        viewedEvents: recentlyViewed,
        location: preferredLocation,
        limit: events.length,
      })
        .map((event) => {
          const selectedBoost =
            (interest && event.category === interest ? interestWeight : 0) +
            (level && event.level === level ? levelWeight : 0) +
            (eventType && event.type === eventType.toLowerCase() ? typeWeight : 0);
          const boost = Math.round(selectedBoost / 10);
          const calculatedMatch = Math.min(100, event.calculatedMatch + boost);

          return {
            ...event,
            calculatedMatch,
            recommendationScore: calculatedMatch,
            breakdown: [
              ...(event.breakdown || []),
              ...(boost > 0 ? [{ label: "Selected preference boost", score: boost }] : []),
            ],
          };
        })
        .sort((a, b) => b.recommendationScore - a.recommendationScore);

      setRecommendedEvents(recommendations.length ? recommendations : trendingNearby);
      setLoading(false);
    }, 1200);
  };

  const otherEvents = events.filter((event) => !recommendedEvents.some((r) => r.id === event.id));

  return (
    <div className="bg-bg text-text min-h-screen px-4 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-text text-3xl font-bold md:text-4xl">
            AI Event Recommendation Assistant
          </h1>

          <p className="text-text-light mt-2 text-sm md:text-base">
            Personalized hackathons and tech events based on your interests and skills.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* LEFT PANEL */}
          <div className="bg-card-bg border-border h-fit rounded-2xl border p-6 shadow-sm">
            <h2 className="text-text mb-5 text-xl font-semibold">Your Preferences</h2>

            <div className="space-y-4">
              {/* Interests */}
              <div>
                <label className="text-text-light mb-2 block text-sm font-medium">Interests</label>

                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-xl border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
                >
                  <option value="">Select Domain</option>

                  <option>AI & Machine Learning</option>

                  <option>Web Development</option>

                  <option>Open Source</option>

                  <option>Security & Privacy</option>
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="text-text-light mb-2 block text-sm font-medium">
                  Skill Level
                </label>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-xl border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
                >
                  <option value="">Select Skill Level</option>

                  <option>Beginner</option>

                  <option>Intermediate</option>

                  <option>Advanced</option>
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="text-text-light mb-2 block text-sm font-medium">Event Type</label>

                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="border-border bg-bg text-text focus:ring-primary focus:border-primary w-full rounded-xl border p-3 transition-all duration-300 focus:ring-1 focus:outline-none"
                >
                  <option value="">Select Event Type</option>

                  <option>Hackathon</option>

                  <option>Workshop</option>

                  <option>Conference</option>
                </select>
              </div>

              {/* Dynamic Weights Sliders */}
              <div className="border-border mt-4 space-y-4 border-t pt-4">
                <div className="text-text flex items-center gap-2 text-sm font-semibold">
                  <Sliders size={16} className="text-primary" />
                  <span>Recommendation Weights</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-text-light mb-1 flex justify-between text-xs font-medium">
                      <span>Domain Match Priority</span>
                      <span className="text-primary font-bold">{interestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={interestWeight}
                      onChange={(e) => setInterestWeight(Number(e.target.value))}
                      className="bg-border accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="text-text-light mb-1 flex justify-between text-xs font-medium">
                      <span>Skill Level Match Priority</span>
                      <span className="text-primary font-bold">{levelWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={levelWeight}
                      onChange={(e) => setLevelWeight(Number(e.target.value))}
                      className="bg-border accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="text-text-light mb-1 flex justify-between text-xs font-medium">
                      <span>Event Type Match Priority</span>
                      <span className="text-primary font-bold">{typeWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={typeWeight}
                      onChange={(e) => setTypeWeight(Number(e.target.value))}
                      className="bg-border accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={generateRecommendations}
                className="bg-primary mt-4 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
                aria-label="Generate recommendations"
              >
                Generate Recommendations
              </button>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-card-bg border-border rounded-2xl border p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-text text-xl font-semibold">Recommended Events</h2>

              <span className="text-text-light text-sm">
                {recommendedEvents.length} Recommendations
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <>
                <div className="sr-only" role="status" aria-live="polite">
                  Searching recommendations...
                </div>
                <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
                  {[...Array(4)].map((_, i) => (
                    <EventCardSkeleton key={i} />
                  ))}
                </div>
              </>
            ) : recommendedEvents.length > 0 ? (
              <>
                {/* Recommendations */}
                <div className="grid gap-4 md:grid-cols-2">
                  {recommendedEvents.map((event, index) => (
                    <div
                      key={index}
                      className="border-border bg-bg rounded-2xl border p-5 transition-all hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {event.calculatedMatch}% Match
                        </span>

                        <span className="text-text-light text-xs">{event.tag}</span>
                      </div>

                      <h3
                        title={event.title}
                        className="text-text line-clamp-2 min-w-0 text-lg font-bold break-words"
                      >
                        {event.title}
                      </h3>

                      <p className="text-text-light mt-2 text-sm">{event.description}</p>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-primary mt-5 flex cursor-pointer items-center gap-1 text-sm font-medium hover:opacity-80"
                      >
                        View Insights & Match Info <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Explore Other Events */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowOtherEvents(!showOtherEvents)}
                    className="border-border hover:bg-card-bg rounded-xl border px-5 py-3 text-sm font-medium transition-all"
                  >
                    {showOtherEvents ? "Hide Other Events" : "Explore Other Events"}
                  </button>
                </div>

                {/* Other Events */}
                {showOtherEvents && (
                  <div className="mt-8">
                    <h3 className="text-text mb-4 text-lg font-semibold">
                      Other Events You May Like
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      {otherEvents.map((event, index) => (
                        <div key={index} className="border-border bg-bg rounded-2xl border p-5">
                          <h3
                            title={event.title}
                            className="text-text line-clamp-2 min-w-0 text-lg font-bold break-words"
                          >
                            {event.title}
                          </h3>

                          <p className="text-text-light mt-2 text-sm">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : !hasSearched ? (
              <EmptyState
                type="default"
                icon={<Sparkles size={48} className="text-primary animate-pulse" />}
                title="Ready to Discover Events?"
                message="Select your preferences and generate personalized recommendations."
              />
            ) : (
              <>
                <EmptyState
                  type="filters"
                  icon={<FilterX size={48} className="text-gray-400" />}
                  title="No Relevant Events Found"
                  message="Try changing your interests, skill level, or recommendation weights to discover more events."
                  onBrowseAll={() => setShowOtherEvents(!showOtherEvents)}
                />

                {showOtherEvents && (
                  <div className="mt-8 grid w-full gap-4 md:grid-cols-2">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className="border-border bg-bg rounded-2xl border p-5 text-left"
                      >
                        <h3
                          title={event.title}
                          className="text-text line-clamp-2 min-w-0 text-lg font-bold break-words"
                        >
                          {event.title}
                        </h3>
                        <p className="text-text-light mt-2 text-sm">{event.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Recommendation Insights Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity">
          <div className="bg-card-bg border-border relative w-full max-w-lg overflow-hidden rounded-3xl border p-6 shadow-2xl">
            {/* Background Glow */}
            <div className="bg-primary/10 pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full blur-3xl" />

            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <span className="bg-primary/10 text-primary border-primary/20 mb-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black">
                  <Sparkles size={12} className="text-primary animate-pulse" />
                  AI Recommendation Score
                </span>
                <h3 className="text-text text-xl leading-tight font-extrabold">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-text-light hover:bg-bg hover:text-text cursor-pointer rounded-lg p-1.5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-bg border-border flex items-center justify-between rounded-2xl border p-4">
                <span className="text-text-light text-sm font-bold">Match Percentage</span>
                <div className="text-right">
                  <span className="text-primary text-3xl font-black">
                    {selectedEvent.calculatedMatch}%
                  </span>
                </div>
              </div>

              {/* Breakdown Matrix */}
              <div className="space-y-3">
                <span className="text-text-light/60 block text-xs font-extrabold tracking-widest uppercase">
                  Match Priority Matrix
                </span>

                {selectedEvent.breakdown &&
                  selectedEvent.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-light flex items-center gap-1.5 font-bold">
                          {item.matched === false ? (
                            <AlertCircle size={14} className="text-text-light/60 shrink-0" />
                          ) : (
                            <CheckCircle2 size={14} className="shrink-0 text-green-500" />
                          )}
                          {item.label}
                        </span>
                        <span className="text-text-light font-medium">+{item.score} pts</span>
                      </div>
                      {/* Visual Progress Bar */}
                      <div className="bg-border h-2 w-full overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.matched === false ? "bg-border" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(item.score * 4, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Description summary */}
              {/* Description summary */}

              <div className="text-text-light border-border border-t pt-4 text-xs leading-relaxed">
                <span className="text-text-light/60 mb-1 block font-bold">
                  Target Audience Insights
                </span>
                Fits best for developers with
                <strong className="text-text font-bold">{selectedEvent.level}</strong>
                level experience, interested in
                <strong className="text-text font-bold">{selectedEvent.category}</strong>.
              </div>

              {/* AI Insights Section */}

              <div className="mt-6">
                <h3 className="text-text mb-3 text-lg font-semibold">AI Recommendation Insights</h3>

                {insightLoading ? (
                  <>
                    <div className="sr-only" role="status" aria-live="polite">
                      Generating AI insights...
                    </div>
                    <div className="space-y-3 py-4" aria-hidden="true">
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-4 w-5/6" />
                      <SkeletonBlock className="h-4 w-4/5" />
                    </div>
                  </>
                ) : (
                  <div className="bg-bg/50 text-text-light rounded-xl p-4 text-sm leading-7 whitespace-pre-line">
                    {aiInsights}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-border mt-6 flex gap-3 border-t pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="border-border text-text hover:bg-bg flex-1 cursor-pointer rounded-xl border px-4 py-2.5 text-xs font-bold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addRegistration(selectedEvent, { source: "recommendation" });
                  showSuccessToast(
                    `Successfully registered for ${selectedEvent.title}! Check your email for confirmation.`
                  );
                  setSelectedEvent(null);
                }}
                className="bg-primary flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:opacity-90"
              >
                Register Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRecommendation;
