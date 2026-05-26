import { useState } from "react";
import {
  X,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const EventRecommendation = () => {

  const events = [
    {
      title: "AI Innovation Challenge",
      category: "AI / ML",
      level: "Beginner",
      type: "Hackathon",
      match: "95%",
      tag: "AI/ML",
      description:
        "Build intelligent AI solutions and compete with developers worldwide.",
    },
    {
      title: "Frontend UI Battle",
      category: "Web Development",
      level: "Intermediate",
      type: "Hackathon",
      match: "92%",
      tag: "React",
      description:
        "Design modern responsive interfaces and interactive experiences.",
    },
    {
      title: "Open Source Sprint",
      category: "Open Source",
      level: "Beginner",
      type: "Hackathon",
      match: "89%",
      tag: "OSS",
      description:
        "Collaborate on impactful open-source projects and communities.",
    },
    {
      title: "Cyber Shield Workshop",
      category: "Cybersecurity",
      level: "Advanced",
      type: "Workshop",
      match: "91%",
      tag: "Security",
      description:
        "Hands-on cybersecurity challenges and ethical hacking sessions.",
    },
    {
      title: "Cloud Computing Conference",
      category: "Web Development",
      level: "Advanced",
      type: "Conference",
      match: "88%",
      tag: "Cloud",
      description:
        "Explore scalable cloud infrastructure and DevOps technologies.",
    },
  ];

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

  const generateRecommendations = () => {
    setHasSearched(true);

    if (!interest && !level && !eventType) {
      setRecommendedEvents([]);
      return;
    }

    setLoading(true);
    setShowOtherEvents(false);

    setTimeout(() => {
      const totalWeight = (interest ? interestWeight : 0) + (level ? levelWeight : 0) + (eventType ? typeWeight : 0);
      
      if (totalWeight === 0) {
        setRecommendedEvents([]);
        setLoading(false);
        return;
      }

      const scored = events.map(event => {
        let score = 0;
        let breakdown = [];
        
        if (interest) {
          const isMatch = event.category === interest;
          if (isMatch) {
            score += interestWeight;
            breakdown.push({ label: "Domain Matches Interest", weight: interestWeight, score: interestWeight, matched: true });
          } else {
            breakdown.push({ label: "Domain Mismatch", weight: interestWeight, score: 0, matched: false });
          }
        }
        
        if (level) {
          const isMatch = event.level === level;
          if (isMatch) {
            score += levelWeight;
            breakdown.push({ label: "Skill Level Matches", weight: levelWeight, score: levelWeight, matched: true });
          } else {
            breakdown.push({ label: "Skill Level Mismatch", weight: levelWeight, score: 0, matched: false });
          }
        }
        
        if (eventType) {
          const isMatch = event.type === eventType;
          if (isMatch) {
            score += typeWeight;
            breakdown.push({ label: "Event Type Matches", weight: typeWeight, score: typeWeight, matched: true });
          } else {
            breakdown.push({ label: "Event Type Mismatch", weight: typeWeight, score: 0, matched: false });
          }
        }
        
        const percentage = Math.round((score / totalWeight) * 100);
        return {
          ...event,
          calculatedMatch: percentage,
          breakdown,
        };
      });

      const filtered = scored
        .filter(event => event.calculatedMatch > 0)
        .sort((a, b) => b.calculatedMatch - a.calculatedMatch);

      setRecommendedEvents(filtered);
      setLoading(false);
    }, 1200);
  };

  const otherEvents = events.filter(
    (event) =>
      !recommendedEvents.some(r => r.title === event.title)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-10 px-4">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-8">

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            AI Event Recommendation Assistant
          </h1>

          <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-400">
            Personalized hackathons and tech events based on your interests and skills.
          </p>

        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">

          {/* LEFT PANEL */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm h-fit">

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-5">
              Your Preferences
            </h2>

            <div className="space-y-4">

              {/* Interests */}
              <div>

                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Interests
                </label>

                <select
                  value={interest}
                  onChange={(e) =>
                    setInterest(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none"
                >
                  <option value="">
                    Select Domain
                  </option>

                  <option>
                    AI / ML
                  </option>

                  <option>
                    Web Development
                  </option>

                  <option>
                    Open Source
                  </option>

                  <option>
                    Cybersecurity
                  </option>

                </select>

              </div>

              {/* Skill Level */}
              <div>

                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Skill Level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none"
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

                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Event Type
                </label>

                <select
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none"
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
              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                  <Sliders size={16} className="text-blue-500" />
                  <span>Recommendation Weights</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
                      <span>Domain Match Priority</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{interestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={interestWeight}
                      onChange={(e) => setInterestWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
                      <span>Skill Level Match Priority</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{levelWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={levelWeight}
                      onChange={(e) => setLevelWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">
                      <span>Event Type Match Priority</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{typeWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={typeWeight}
                      onChange={(e) => setTypeWeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={generateRecommendations}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-all text-white rounded-xl py-3 text-sm font-semibold"
              >
                Generate Recommendations
              </button>

            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Recommended Events
              </h2>

              <span className="text-sm text-slate-500 dark:text-slate-400">
                {recommendedEvents.length} Recommendations
              </span>

            </div>

            {/* Loading */}
            {loading ? (

              <div className="flex flex-col items-center justify-center py-20">

                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                <p className="mt-5 text-slate-500 dark:text-slate-400">
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
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all bg-slate-50 dark:bg-slate-800/50"
                    >

                      <div className="flex items-center justify-between mb-4">

                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          {event.calculatedMatch}% Match
                        </span>

                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {event.tag}
                        </span>

                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {event.title}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {event.description}
                      </p>

                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
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
                    className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-medium"
                  >
                    {showOtherEvents
                      ? "Hide Other Events"
                      : "Explore Other Events"}
                  </button>

                </div>

                {/* Other Events */}
                {showOtherEvents && (

                  <div className="mt-8">

                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                      Other Events You May Like
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">

                      {otherEvents.map((event, index) => (

                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800"
                        >

                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {event.title}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Ready to Discover Events?
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Select your preferences and generate personalized recommendations.
                </p>

              </div>

            ) : (

              <div className="flex flex-col items-center justify-center py-20 text-center">

                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  No Relevant Events Found
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Try changing your interests, skill level, or event type.
                </p>

                <button
                  onClick={() =>
                    setShowOtherEvents(!showOtherEvents)
                  }
                  className="mt-6 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all"
                >
                  Explore All Events
                </button>

                {showOtherEvents && (

                  <div className="mt-8 w-full grid md:grid-cols-2 gap-4">

                    {events.map((event, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800 text-left"
                      >

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {event.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30 mb-2">
                  <Sparkles size={12} className="animate-pulse text-blue-500" />
                  AI Recommendation Score
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Match Percentage</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{selectedEvent.calculatedMatch}%</span>
                </div>
              </div>

              {/* Breakdown Matrix */}
              <div className="space-y-3">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">Match Priority Matrix</span>
                
                {selectedEvent.breakdown && selectedEvent.breakdown.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                        {item.matched ? (
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="text-slate-400 shrink-0" />
                        )}
                        {item.label}
                      </span>
                      <span className="text-slate-400 font-medium">
                        {item.matched ? `+${item.score}%` : `0% / ${item.weight}%`}
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-850 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.matched ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        style={{ width: `${item.matched ? 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Description summary */}
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <span className="font-bold text-slate-400 block mb-1">Target Audience Insights</span>
                Fits best for developers with <strong className="text-slate-750 dark:text-slate-200 font-bold">{selectedEvent.level}</strong> level experience, interested in <strong className="text-slate-755 dark:text-slate-200 font-bold">{selectedEvent.category}</strong>.
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`Successfully registered for ${selectedEvent.title}! Check your email for confirmation.`);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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