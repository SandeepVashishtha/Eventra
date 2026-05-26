import { useState } from "react";

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

  const [interest, setInterest] =
    useState("");

  const [level, setLevel] =
    useState("");

  const [eventType, setEventType] =
    useState("");

  const [recommendedEvents, setRecommendedEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [showOtherEvents, setShowOtherEvents] =
    useState(false);

  const [hasSearched, setHasSearched] =
    useState(false);

  const generateRecommendations = () => {

    setHasSearched(true);

    if (!interest || !level || !eventType) {
      setRecommendedEvents([]);
      return;
    }

    setLoading(true);

    setShowOtherEvents(false);

    setTimeout(() => {

      const filtered = events.filter(
        (event) =>
          event.category === interest &&
          event.level === level &&
          event.type === eventType
      );

      setRecommendedEvents(filtered);

      setLoading(false);

    }, 1500);
  };

  const otherEvents = events.filter(
    (event) =>
      !recommendedEvents.includes(event)
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
                          {event.match} Match
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

                      <button className="mt-5 text-sm font-medium text-blue-600 hover:text-blue-700">
                        View Event →
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

    </div>
  );
};

export default EventRecommendation;