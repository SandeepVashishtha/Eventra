import { useMemo, useState, useEffect } from "react";
import {
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  generateAIInsights
} from "../../services/aiRecommendationService";

import {
  getUserProfile
} from "../../utils/userProfileAnalyzer";
import { safeSetItem } from "../../utils/safeStorage.js";

import {
  buildPersonalizedRecommendations,
  getTrendingEventsForArea,
} from "../../utils/recommendationEngine";
import { useAuth } from "../../context/AuthContext";
import { useMyEvents } from "../../context/MyEventsContext";
import useBookmarks from "../../hooks/useBookmarks";
import useRecentlyViewed from "../../hooks/useRecentlyViewed";
import {
  getBookmarkedEvents,
  subscribeToBookmarkChanges,
} from "../../utils/bookmarkUtils";
import mockEvents from "../Events/eventsMockData.json";


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
          (event.price === 0
            ? "Beginner"
            : event.price > 500
              ? "Advanced"
              : "Intermediate"),
        tag: event.tags?.[0] || event.category,
      })),
    [],
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

    const profile =
      getUserProfile();

    const insights =
      await generateAIInsights(
        selectedEvent,
        profile
      );

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
    [events, preferredLocation],
  );

  const generateRecommendations = () => {
    setHasSearched(true);
    setLoading(true);
    setShowOtherEvents(false);
    
    // Track execution for onboarding checklist
    safeSetItem("eventra_ai_recommendation_generated", "true");

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
      }).map((event) => {
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
            ...(boost > 0
              ? [{ label: "Selected preference boost", score: boost }]
              : []),
          ],
        };
      }).sort((a, b) => b.recommendationScore - a.recommendationScore);

      setRecommendedEvents(recommendations.length ? recommendations : trendingNearby);
      setLoading(false);
    }, 1200);
  };

  const otherEvents = events.filter(
    (event) =>
      !recommendedEvents.some(r => r.id === event.id)
  );

  return (
    <div className="min-h-screen bg-bg text-text py-10 px-4">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-text">
            AI Event Recommendation Assistant
          </h1>

          <p className="mt-2 text-sm md:text-base text-text-light">
            Personalized hackathons and tech events based on your interests and skills.
          </p>

        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">

          {/* LEFT PANEL */}
          <div className="bg-card-bg rounded-2xl p-6 border border-border shadow-sm h-fit">

            <h2 className="text-xl font-semibold text-text mb-5">
              Your Preferences
            </h2>

            <div className="space-y-4">

              {/* Interests */}
              <div>

                <label className="block text-sm font-medium mb-2 text-text-light">
                  Interests
                </label>

                <select
                  value={interest}
                  onChange={(e) =>
                    setInterest(e.target.value)
                  }
                  className="w-full border border-border rounded-xl p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                >
                  <option value="">
                    Select Domain
                  </option>

                  <option>
                    AI & Machine Learning
                  </option>

                  <option>
                    Web Development
                  </option>

                  <option>
                    Open Source
                  </option>

                  <option>
                    Security & Privacy
                  </option>

                </select>

              </div>

              {/* Skill Level */}
              <div>

                <label className="block text-sm font-medium mb-2 text-text-light">
                  Skill Level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full border border-border rounded-xl p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                >
                  <option value="">
                    Select Skill Level
                  </option>

                  <option>
                    Beginner
                  </option>

                  <option>
                    Intermediate
                  </option>

                  <option>
                    Advanced
                  </option>

                </select>

              </div>

              {/* Event Type */}
              <div>

                <label className="block text-sm font-medium mb-2 text-text-light">
                  Event Type
                </label>

                <select
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value)
                  }
                  className="w-full border border-border rounded-xl p-3 bg-bg text-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                >
                  <option value="">
                    Select Event Type
                  </option>

                  <option>
                    Hackathon
                  </option>

                  <option>
                    Workshop
                  </option>

                  <option>
                    Conference
                  </option>

                </select>

              </div>

              {/* Dynamic Weights Sliders */}
              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex items-center gap-2 text-text font-semibold text-sm">
                  <Sliders size={16} className="text-primary" />
                  <span>Recommendation Weights</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-text-light">
                      <span>Domain Match Priority</span>
                      <span className="text-primary font-bold">{interestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={interestWeight}
                      onChange={(e) => setInterestWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-text-light">
                      <span>Skill Level Match Priority</span>
                      <span className="text-primary font-bold">{levelWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={levelWeight}
                      onChange={(e) => setLevelWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-text-light">
                      <span>Event Type Match Priority</span>
                      <span className="text-primary font-bold">{typeWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={typeWeight}
                      onChange={(e) => setTypeWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={generateRecommendations}
                className="w-full mt-4 bg-primary hover:opacity-90 transition-all text-white rounded-xl py-3 text-sm font-semibold"
                aria-label="Generate recommendations">
                Generate Recommendations
              </button>

            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="bg-card-bg rounded-2xl p-6 border border-border shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold text-text">
                Recommended Events
              </h2>

              <span className="text-sm text-text-light">
                {recommendedEvents.length} Recommendations
              </span>

            </div>

            {/* Loading */}
            {loading ? (

              <div className="flex flex-col items-center justify-center py-20">

                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>

                <p className="mt-5 text-text-light">
                  Searching recommendations...
                </p>

              </div>

            ) : recommendedEvents.length > 0 ? (

              <>
                {/* Recommendations */}
                <div className="grid md:grid-cols-2 gap-4">

                  {recommendedEvents.map((event, index) => (

                    <div
                      key={index}
                      className="rounded-2xl border border-border p-5 hover:shadow-md transition-all bg-bg"
                    >

                      <div className="flex items-center justify-between mb-4">

                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {event.calculatedMatch}% Match
                        </span>

                        <span className="text-xs text-text-light">
                          {event.tag}
                        </span>

                      </div>

                      <h3 className="text-lg font-bold text-text">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-sm text-text-light">
                        {event.description}
                      </p>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="mt-5 text-sm font-medium text-primary hover:opacity-80 flex items-center gap-1 cursor-pointer"
                      >
                        View Insights & Match Info <ChevronRight size={14} />
                      </button>

                    </div>

                  ))}

                </div>

                {/* Explore Other Events */}
                <div className="mt-8">

                  <button
                    onClick={() =>
                      setShowOtherEvents(!showOtherEvents)
                    }
                    className="px-5 py-3 rounded-xl border border-border hover:bg-card-bg transition-all text-sm font-medium"
                  >
                    {showOtherEvents
                      ? "Hide Other Events"
                      : "Explore Other Events"}
                  </button>

                </div>

                {/* Other Events */}
                {showOtherEvents && (

                  <div className="mt-8">

                    <h3 className="text-lg font-semibold mb-4 text-text">
                      Other Events You May Like
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">

                      {otherEvents.map((event, index) => (

                        <div
                          key={index}
                          className="rounded-2xl border border-border p-5 bg-bg"
                        >

                          <h3 className="text-lg font-bold text-text">
                            {event.title}
                          </h3>

                          <p className="mt-2 text-sm text-text-light">
                            {event.description}
                          </p>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </>

            ) : !hasSearched ? (

              <div className="flex flex-col items-center justify-center py-20 text-center">

                <h3 className="text-xl font-semibold text-text">
                  Ready to Discover Events?
                </h3>

                <p className="mt-2 text-sm text-text-light max-w-md">
                  Select your preferences and generate personalized recommendations.
                </p>

              </div>

            ) : (

              <div className="flex flex-col items-center justify-center py-20 text-center">

                <h3 className="text-xl font-semibold text-text">
                  No Relevant Events Found
                </h3>

                <p className="mt-2 text-sm text-text-light max-w-md">
                  Try changing your interests, skill level, or event type.
                </p>

                <button
                  onClick={() =>
                    setShowOtherEvents(!showOtherEvents)
                  }
                  className="mt-6 px-5 py-3 rounded-xl bg-primary hover:opacity-90 text-white text-sm font-medium transition-all"
                >
                  Explore All Events
                </button>

                {showOtherEvents && (

                  <div className="mt-8 w-full grid md:grid-cols-2 gap-4">

                    {events.map((event, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-border p-5 bg-bg text-left"
                      >

                        <h3 className="text-lg font-bold text-text">
                          {event.title}
                        </h3>

                        <p className="mt-2 text-sm text-text-light">
                          {event.description}
                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      </div>

      {/* Detailed Recommendation Insights Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="relative w-full max-w-lg bg-card-bg border border-border rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20 mb-2">
                  <Sparkles size={12} className="animate-pulse text-primary" />
                  AI Recommendation Score
                </span>
                <h3 className="text-xl font-extrabold text-text leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-text-light hover:bg-bg hover:text-text transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 bg-bg rounded-2xl border border-border">
                <span className="text-sm font-bold text-text-light">Match Percentage</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-primary">{selectedEvent.calculatedMatch}%</span>
                </div>
              </div>

              {/* Breakdown Matrix */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-text-light/60 uppercase tracking-widest block">Match Priority Matrix</span>
                
                {selectedEvent.breakdown && selectedEvent.breakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-text-light">
                        {item.matched === false ? (
                          <AlertCircle size={14} className="text-text-light/60 shrink-0" />
                        ) : (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        )}
                        {item.label}
                      </span>
                      <span className="text-text-light font-medium">
                        +{item.score} pts
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-border overflow-hidden">
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

<div className="text-xs text-text-light leading-relaxed border-t border-border pt-4">

  <span className="font-bold text-text-light/60 block mb-1">
    Target Audience Insights
  </span>

  Fits best for developers with
  <strong className="text-text font-bold">
    {selectedEvent.level}
  </strong>

  level experience, interested in

  <strong className="text-text font-bold">
    {selectedEvent.category}
  </strong>.

</div>


{/* AI Insights Section */}

<div className="mt-6">

  <h3 className="text-lg font-semibold mb-3 text-text">

    AI Recommendation Insights

  </h3>

  {insightLoading ? (

    <p className="text-text-light">

      Generating AI insights...

    </p>

  ) : (

    <div
      className="
        rounded-xl
        bg-bg/50
        p-4
        text-sm
        text-text-light
        leading-7
        whitespace-pre-line
      "
    >

      {aiInsights}

    </div>

  )}

</div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6 border-t border-border pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-text hover:bg-bg text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  addRegistration(selectedEvent, { source: "recommendation" });
                  toast.success(`Successfully registered for ${selectedEvent.title}! Check your email for confirmation.`);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Register Event
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toaster position="bottom-right" />
    </div>
  );
};

export default EventRecommendation;
