import {
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Heart,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_DATA = {
  interests: ["AI/ML", "Web Development", "Data Science"],
  skills: ["Python", "React", "Machine Learning"],
  attendedEvents: ["AI Hackathon 2026"],
  bookmarkedEvents: ["Cloud Workshop"],
  events: [
    {
      id: 1,
      title: "AI & Machine Learning Summit",
      category: "AI/ML",
      skills: ["Python", "Machine Learning"],
      tags: ["AI/ML", "Data Science"],
      date: "Aug 22, 2026",
      attendees: 180,
    },
    {
      id: 2,
      title: "Modern React Development",
      category: "Web Development",
      skills: ["React", "JavaScript"],
      tags: ["Web Development"],
      date: "Aug 25, 2026",
      attendees: 120,
    },
    {
      id: 3,
      title: "Data Science & Analytics",
      category: "Data Science",
      skills: ["Python", "SQL"],
      tags: ["Data Science", "AI/ML"],
      date: "Aug 28, 2026",
      attendees: 150,
    },
    {
      id: 4,
      title: "Cloud Computing Workshop",
      category: "Cloud",
      skills: ["Docker", "AWS"],
      tags: ["Cloud", "DevOps"],
      date: "Sep 2, 2026",
      attendees: 90,
    },
  ],
};

const calculateMatch = (event, data) => {
  let score = 0;

  const interestMatches = event.tags.filter((tag) =>
    data.interests.includes(tag)
  );

  const skillMatches = event.skills.filter((skill) =>
    data.skills.includes(skill)
  );

  if (data.interests.includes(event.category)) {
    score += 35;
  }

  score += Math.min(interestMatches.length * 15, 30);
  score += Math.min(skillMatches.length * 15, 30);

  const attendedCategoryMatch = data.attendedEvents.some(
    (name) =>
      name.toLowerCase().includes(event.category.toLowerCase())
  );

  if (attendedCategoryMatch) {
    score += 5;
  }

  const bookmarkedCategoryMatch =
    data.bookmarkedEvents.some((name) =>
      name.toLowerCase().includes(event.category.toLowerCase())
    );

  if (bookmarkedCategoryMatch) {
    score += 5;
  }

  return {
    score: Math.min(score, 100),
    interestMatches,
    skillMatches,
  };
};

const getMatchStyle = (score) => {
  if (score >= 80) {
    return "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }

  if (score >= 60) {
    return "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400";
  }

  if (score >= 40) {
    return "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
  }

  return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
};

const EventParticipantInterestMatching = ({
  data = DEFAULT_DATA,
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [bookmarked, setBookmarked] = useState(
    data.bookmarkedEvents
  );

  const recommendations = useMemo(() => {
    return data.events
      .map((event) => ({
        ...event,
        match: calculateMatch(event, data),
      }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [data]);

  const categories = [
    "All",
    ...new Set(data.events.map((event) => event.category)),
  ];

  const filteredEvents =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (event) => event.category === selectedCategory
        );

  const averageMatch = recommendations.length
    ? Math.round(
        recommendations.reduce(
          (sum, event) => sum + event.match.score,
          0
        ) / recommendations.length
      )
    : 0;

  const toggleBookmark = (event) => {
    setBookmarked((current) =>
      current.includes(event.title)
        ? current.filter((title) => title !== event.title)
        : [...current, event.title]
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Sparkles size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Personalized Discovery
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Recommended Events
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Discover events matched to your interests, skills,
              activity, and previous event interactions.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-center dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
            Average Match
          </p>

          <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {averageMatch}%
          </p>
        </div>
      </div>

      {/* User Profile Signals */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileCard
          icon={Heart}
          title="Interests"
          value={data.interests.length}
          description="selected interests"
        />

        <ProfileCard
          icon={Target}
          title="Skills"
          value={data.skills.length}
          description="profile skills"
        />

        <ProfileCard
          icon={CalendarDays}
          title="Attended"
          value={data.attendedEvents.length}
          description="previous events"
        />

        <ProfileCard
          icon={Bookmark}
          title="Bookmarked"
          value={bookmarked.length}
          description="saved events"
        />
      </div>

      {/* Interests */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Heart
            size={15}
            className="text-pink-500"
          />

          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Your Interests
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Recommendations are influenced by your selected
              interests.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.interests.map((interest) => (
            <span
              key={interest}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-[7px] font-bold text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-900/10 dark:text-indigo-400"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() =>
              setSelectedCategory(category)
            }
            className={`rounded-xl px-4 py-2 text-[6px] font-bold transition ${
              selectedCategory === category
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-500 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
              Recommended for You
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Events ranked by relevance to your profile.
            </p>
          </div>

          <span className="text-[6px] font-bold text-slate-400">
            {filteredEvents.length} events
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filteredEvents.map((event) => {
            const isBookmarked = bookmarked.includes(
              event.title
            );

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <CalendarDays size={17} />
                    </div>

                    <div>
                      <h4 className="text-[9px] font-bold text-slate-800 dark:text-white">
                        {event.title}
                      </h4>

                      <p className="mt-1 text-[6px] text-slate-400">
                        {event.category}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[6px] font-bold ${getMatchStyle(
                      event.match.score
                    )}`}
                  >
                    {event.match.score}% Match
                  </span>
                </div>

                {/* Match Progress */}
                <div className="mt-5">
                  <div className="flex justify-between">
                    <span className="text-[6px] font-bold text-slate-400">
                      Relevance
                    </span>

                    <span className="text-[6px] font-bold text-indigo-500">
                      {event.match.score}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{
                        width: `${event.match.score}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Matching Signals */}
                <div className="mt-5">
                  <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                    Why this event?
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.match.interestMatches.map(
                      (interest) => (
                        <span
                          key={`interest-${interest}`}
                          className="rounded-lg bg-pink-50 px-2 py-1 text-[5px] font-bold text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
                        >
                          Interest: {interest}
                        </span>
                      )
                    )}

                    {event.match.skillMatches.map(
                      (skill) => (
                        <span
                          key={`skill-${skill}`}
                          className="rounded-lg bg-green-50 px-2 py-1 text-[5px] font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        >
                          Skill: {skill}
                        </span>
                      )
                    )}

                    {event.match.interestMatches.length ===
                      0 &&
                      event.match.skillMatches.length ===
                        0 && (
                        <span className="text-[6px] text-slate-400">
                          Matched using your event activity.
                        </span>
                      )}
                  </div>
                </div>

                {/* Event Details */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {event.date}
                  </span>

                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {event.attendees} participants
                  </span>

                  {event.skills
                    .slice(0, 2)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-[5px] text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {skill}
                      </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBookmark(event)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[6px] font-bold transition ${
                      isBookmarked
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <Bookmark
                      size={12}
                      fill={
                        isBookmarked
                          ? "currentColor"
                          : "none"
                      }
                    />

                    {isBookmarked
                      ? "Bookmarked"
                      : "Bookmark"}
                  </button>

                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-[6px] font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    View Event
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <Sparkles
              size={22}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-[8px] font-bold text-slate-600 dark:text-slate-300">
              No matching events found
            </p>

            <p className="mt-1 text-[6px] text-slate-400">
              Try selecting another category.
            </p>
          </div>
        )}
      </div>

      {/* Recommendation Explanation */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
            <Sparkles size={17} />
          </div>

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              How recommendations work
            </h3>

            <p className="mt-1 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Events are matched using your interests, skills,
              previously attended events, bookmarked events,
              categories, and event topics. Higher match scores
              indicate stronger relevance to your profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProfileCard = ({
  icon: Icon,
  title,
  value,
  description,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-xl font-black text-slate-800 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

export default EventParticipantInterestMatching;