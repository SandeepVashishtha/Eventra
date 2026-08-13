import {
  Bookmark,
  CheckCircle2,
  Clock3,
  MapPin,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "AI & Machine Learning Fundamentals",
    speaker: "Dr. Priya Sharma",
    track: "AI/ML",
    topics: ["AI", "Machine Learning", "Python"],
    time: "10:00 AM - 11:00 AM",
    venue: "Room A",
    popularity: 94,
    bookmarked: true,
  },
  {
    id: 2,
    title: "Building Modern Web Applications",
    speaker: "Rahul Patel",
    track: "Web Development",
    topics: ["React", "JavaScript", "Frontend"],
    time: "11:30 AM - 12:30 PM",
    venue: "Room B",
    popularity: 88,
    bookmarked: false,
  },
  {
    id: 3,
    title: "Data Science with Python",
    speaker: "Neha Joshi",
    track: "Data Science",
    topics: ["Python", "Data Science", "Analytics"],
    time: "01:30 PM - 02:30 PM",
    venue: "Room C",
    popularity: 91,
    bookmarked: true,
  },
  {
    id: 4,
    title: "Cloud Computing & DevOps",
    speaker: "Amit Shah",
    track: "Cloud",
    topics: ["Cloud", "AWS", "DevOps"],
    time: "03:00 PM - 04:00 PM",
    venue: "Main Hall",
    popularity: 82,
    bookmarked: false,
  },
  {
    id: 5,
    title: "IoT Smart Systems",
    speaker: "Karan Mehta",
    track: "IoT",
    topics: ["IoT", "Arduino", "Sensors"],
    time: "04:30 PM - 05:30 PM",
    venue: "Lab 1",
    popularity: 76,
    bookmarked: false,
  },
];

const DEFAULT_INTERESTS = [
  "AI",
  "Machine Learning",
  "Python",
  "Data Science",
];

const EventParticipantSessionRecommendations = ({
  sessions = DEFAULT_SESSIONS,
  interests = DEFAULT_INTERESTS,
  skills = [],
  eventTrack = "",
}) => {
  const [selectedInterests, setSelectedInterests] =
    useState(interests);

  const [items, setItems] = useState(sessions);

  const [showAll, setShowAll] = useState(false);

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const toggleBookmark = (id) => {
    setItems((current) =>
      current.map((session) =>
        session.id === id
          ? {
              ...session,
              bookmarked: !session.bookmarked,
            }
          : session
      )
    );
  };

  const recommendations = useMemo(() => {
    const participantSignals = [
      ...selectedInterests,
      ...skills,
    ].map((item) => item.toLowerCase());

    return items
      .map((session) => {
        let score = 0;

        const sessionTopics = session.topics.map((topic) =>
          topic.toLowerCase()
        );

        const track = session.track.toLowerCase();

        // Interest matching
        participantSignals.forEach((signal) => {
          if (sessionTopics.includes(signal)) {
            score += 25;
          }

          if (track.includes(signal)) {
            score += 15;
          }
        });

        // Event track matching
        if (
          eventTrack &&
          track === eventTrack.toLowerCase()
        ) {
          score += 20;
        }

        // Previously bookmarked sessions
        if (session.bookmarked) {
          score += 10;
        }

        // Popular sessions
        score += Math.round(session.popularity / 20);

        return {
          ...session,
          recommendationScore: Math.min(
            100,
            score
          ),
        };
      })
      .sort(
        (a, b) =>
          b.recommendationScore -
          a.recommendationScore
      );
  }, [
    items,
    selectedInterests,
    skills,
    eventTrack,
  ]);

  const visibleSessions = showAll
    ? recommendations
    : recommendations.slice(0, 4);

  const availableInterests = useMemo(() => {
    const topics = items.flatMap(
      (session) => session.topics
    );

    return [...new Set(topics)];
  }, [items]);

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
              Personalized For You
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Recommended Sessions
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Discover sessions matched to your interests,
              skills, bookmarks, and event tracks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <Sparkles
            size={14}
            className="text-indigo-500"
          />

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
              Recommendations
            </p>

            <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
              {recommendations.length}
            </p>
          </div>
        </div>
      </div>

      {/* Interests */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Your Interests
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Select topics to improve your recommendations.
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {selectedInterests.length} selected
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {availableInterests.map((interest) => {
            const selected =
              selectedInterests.includes(interest);

            return (
              <button
                key={interest}
                type="button"
                onClick={() =>
                  toggleInterest(interest)
                }
                className={`rounded-full px-3 py-2 text-[6px] font-bold transition ${
                  selected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200 hover:text-indigo-600 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-700"
                }`}
              >
                {selected && "✓ "}
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendation heading */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 dark:text-white">
            Recommended for You
          </h3>

          <p className="mt-1 text-[7px] text-slate-400">
            Based on your selected interests and session activity.
          </p>
        </div>

        <div className="hidden items-center gap-1 text-[6px] font-bold text-indigo-500 sm:flex">
          <Star size={11} />
          Best matches first
        </div>
      </div>

      {/* Session Cards */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {visibleSessions.map((session) => (
          <RecommendationCard
            key={session.id}
            session={session}
            onBookmark={() =>
              toggleBookmark(session.id)
            }
          />
        ))}
      </div>

      {/* Empty */}
      {visibleSessions.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-700">
          <Sparkles
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
            No matching sessions
          </p>

          <p className="mt-1 text-[7px] text-slate-400">
            Try selecting different interests.
          </p>
        </div>
      )}

      {/* Show more */}
      {recommendations.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-5 w-full rounded-xl border border-slate-200 bg-white py-3 text-[7px] font-bold text-indigo-600 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:text-indigo-400"
        >
          {showAll
            ? "Show fewer sessions"
            : `View all ${recommendations.length} recommendations`}
        </button>
      )}
    </section>
  );
};

/* --------------------------------
   Recommendation Card
--------------------------------- */

const RecommendationCard = ({
  session,
  onBookmark,
}) => {
  const score = session.recommendationScore;

  const matchLabel =
    score >= 70
      ? "Excellent Match"
      : score >= 45
      ? "Good Match"
      : "Recommended";

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[5px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <Sparkles size={9} />
              {matchLabel}
            </span>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {session.track}
            </span>
          </div>

          <h4 className="mt-3 text-[10px] font-bold leading-4 text-slate-800 dark:text-white">
            {session.title}
          </h4>

          <p className="mt-1 text-[7px] text-slate-400">
            Presented by {session.speaker}
          </p>
        </div>

        <button
          type="button"
          onClick={onBookmark}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
            session.bookmarked
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              : "bg-slate-50 text-slate-400 hover:text-indigo-600 dark:bg-slate-950"
          }`}
          aria-label={
            session.bookmarked
              ? "Remove bookmark"
              : "Bookmark session"
          }
        >
          <Bookmark
            size={15}
            fill={
              session.bookmarked
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* Match Score */}
      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <span className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
            Recommendation match
          </span>

          <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400">
            {score}%
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{
              width: `${Math.max(score, 5)}%`,
            }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <InfoItem
          icon={Clock3}
          text={session.time}
        />

        <InfoItem
          icon={MapPin}
          text={session.venue}
        />

        <InfoItem
          icon={Users}
          text={`${session.popularity}% attendee interest`}
        />

        <InfoItem
          icon={Star}
          text={`${session.topics.length} related topics`}
        />
      </div>

      {/* Topics */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {session.topics.map((topic) => (
          <span
            key={topic}
            className="rounded-md bg-slate-100 px-2 py-1 text-[5px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Action */}
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700"
      >
        View Session
        <CheckCircle2 size={12} />
      </button>
    </article>
  );
};

/* --------------------------------
   Info Item
--------------------------------- */

const InfoItem = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2">
    <Icon
      size={11}
      className="shrink-0 text-indigo-500"
    />

    <span className="truncate text-[6px] text-slate-500 dark:text-slate-400">
      {text}
    </span>
  </div>
);

export default EventParticipantSessionRecommendations;