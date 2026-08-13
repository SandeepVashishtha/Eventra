    import {
  Bookmark,
  CalendarClock,
  ChevronRight,
  MapPin,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: "AI & Machine Learning Summit",
    category: "AI/ML",
    location: "Rajkot",
    date: "2026-08-28",
    registrationDeadline: "2026-08-22",
    skills: ["Python", "Machine Learning"],
    bookmarked: true,
    participants: 320,
  },
  {
    id: 2,
    title: "Full Stack Development Workshop",
    category: "Web Development",
    location: "Ahmedabad",
    date: "2026-09-02",
    registrationDeadline: "2026-08-26",
    skills: ["React", "JavaScript"],
    bookmarked: false,
    participants: 240,
  },
  {
    id: 3,
    title: "Data Science Hackathon",
    category: "Data Science",
    location: "Rajkot",
    date: "2026-09-05",
    registrationDeadline: "2026-08-30",
    skills: ["Python", "Data Science"],
    bookmarked: true,
    participants: 410,
  },
  {
    id: 4,
    title: "Cybersecurity Bootcamp",
    category: "Cybersecurity",
    location: "Online",
    date: "2026-09-12",
    registrationDeadline: "2026-09-06",
    skills: ["Security", "Networking"],
    bookmarked: false,
    participants: 180,
  },
];

const DEFAULT_PROFILE = {
  favoriteCategories: ["AI/ML", "Data Science"],
  skills: ["Python", "Machine Learning", "React"],
  location: "Rajkot",
  previousCategories: ["AI/ML", "Web Development"],
  bookmarkedEventIds: [1, 3],
};

const EventParticipantPersonalizedEventFeed = ({
  events = DEFAULT_EVENTS,
  profile = DEFAULT_PROFILE,
  onEventClick,
}) => {
  const [activeSection, setActiveSection] = useState(
    "recommended"
  );

  const feed = useMemo(() => {
    const today = new Date();

    const calculateDaysUntil = (dateString) => {
      const target = new Date(dateString);
      const difference =
        target.getTime() - today.getTime();

      return Math.ceil(
        difference / (1000 * 60 * 60 * 24)
      );
    };

    const scoredEvents = events.map((event) => {
      let score = 0;

      const categoryMatch =
        profile.favoriteCategories?.includes(
          event.category
        );

      const previousCategoryMatch =
        profile.previousCategories?.includes(
          event.category
        );

      const locationMatch =
        event.location?.toLowerCase() ===
          profile.location?.toLowerCase() ||
        event.location?.toLowerCase() === "online";

      const matchingSkills =
        event.skills?.filter((skill) =>
          profile.skills?.some(
            (userSkill) =>
              userSkill.toLowerCase() ===
              skill.toLowerCase()
          )
        ) || [];

      const bookmarked =
        event.bookmarked ||
        profile.bookmarkedEventIds?.includes(event.id);

      const daysToDeadline = calculateDaysUntil(
        event.registrationDeadline
      );

      if (categoryMatch) score += 30;
      if (previousCategoryMatch) score += 15;
      if (locationMatch) score += 15;
      if (bookmarked) score += 20;

      score += matchingSkills.length * 10;

      if (daysToDeadline >= 0 && daysToDeadline <= 7) {
        score += 10;
      }

      return {
        ...event,
        score,
        categoryMatch,
        locationMatch,
        matchingSkills,
        bookmarked,
        daysToDeadline,
      };
    });

    const recommended = [...scoredEvents]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    const closingSoon = [...scoredEvents]
      .filter(
        (event) =>
          event.daysToDeadline >= 0 &&
          event.daysToDeadline <= 7
      )
      .sort(
        (a, b) =>
          a.daysToDeadline - b.daysToDeadline
      )
      .slice(0, 6);

    const interests = [...scoredEvents]
      .filter(
        (event) =>
          event.categoryMatch ||
          event.matchingSkills.length > 0
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    return {
      recommended,
      closingSoon,
      interests,
    };
  }, [events, profile]);

  const currentEvents =
    activeSection === "closing"
      ? feed.closingSoon
      : activeSection === "interests"
      ? feed.interests
      : feed.recommended;

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
              Your Event Feed
            </h2>

            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
              Discover events selected using your interests,
              skills, location, bookmarks, previous participation,
              and upcoming registration deadlines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
          <TrendingUp
            size={14}
            className="text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
              Personalized
            </p>

            <p className="text-[8px] font-black text-indigo-700 dark:text-indigo-300">
              {events.length} events analyzed
            </p>
          </div>
        </div>
      </div>

      {/* Personalization Signals */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SignalCard
          icon={Tag}
          title="Categories"
          value={profile.favoriteCategories?.length || 0}
          description="favorite categories"
        />

        <SignalCard
          icon={Star}
          title="Skills"
          value={profile.skills?.length || 0}
          description="profile skills"
        />

        <SignalCard
          icon={MapPin}
          title="Location"
          value={profile.location || "Any"}
          description="preferred location"
        />

        <SignalCard
          icon={Bookmark}
          title="Bookmarks"
          value={profile.bookmarkedEventIds?.length || 0}
          description="saved events"
        />
      </div>

      {/* Section Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FeedTab
          active={activeSection === "recommended"}
          onClick={() => setActiveSection("recommended")}
          icon={Sparkles}
          label="Recommended for You"
        />

        <FeedTab
          active={activeSection === "closing"}
          onClick={() => setActiveSection("closing")}
          icon={CalendarClock}
          label="Closing Soon"
        />

        <FeedTab
          active={activeSection === "interests"}
          onClick={() => setActiveSection("interests")}
          icon={Star}
          label="Based on Your Interests"
        />
      </div>

      {/* Events */}
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {currentEvents.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <Sparkles
              size={30}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <p className="mt-3 text-[9px] font-bold text-slate-500 dark:text-slate-400">
              No matching events found
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Try updating your interests or skills.
            </p>
          </div>
        ) : (
          currentEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick?.(event)}
            />
          ))
        )}
      </div>

      {/* Recommendation Explanation */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900/30 dark:bg-indigo-900/10">
        <div className="flex items-start gap-3">
          <Sparkles
            size={16}
            className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
          />

          <div>
            <h3 className="text-[9px] font-bold text-indigo-800 dark:text-indigo-300">
              How your feed is personalized
            </h3>

            <p className="mt-2 text-[7px] leading-4 text-indigo-700 dark:text-indigo-400">
              Events receive higher relevance when their category
              matches your interests, their skills match your
              profile, they are available in your location, or
              you have bookmarked or previously participated in
              similar events. Upcoming registration deadlines are
              also prioritized.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const SignalCard = ({
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

      <div className="min-w-0">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-1 truncate text-sm font-black text-slate-800 dark:text-white">
          {value}
        </p>

        <p className="mt-1 text-[5px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  </div>
);

const FeedTab = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[7px] font-bold transition ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-indigo-400"
    }`}
  >
    <Icon size={13} />
    {label}
  </button>
);

const EventCard = ({ event, onClick }) => {
  const deadlineLabel =
    event.daysToDeadline < 0
      ? "Registration closed"
      : event.daysToDeadline === 0
      ? "Closes today"
      : event.daysToDeadline === 1
      ? "Closes tomorrow"
      : `${event.daysToDeadline} days left`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      {/* Card Header */}
      <div className="relative border-b border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[6px] font-bold text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            {event.category}
          </span>

          {event.bookmarked && (
            <Bookmark
              size={15}
              className="fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400"
            />
          )}
        </div>

        <h3 className="mt-4 line-clamp-2 text-sm font-black text-slate-800 dark:text-white">
          {event.title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-[7px] text-slate-400">
          <MapPin size={11} />

          {event.location}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Recommendation Match */}
        <div className="rounded-xl bg-indigo-50 px-3 py-2.5 dark:bg-indigo-900/10">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[6px] font-bold uppercase tracking-wide text-indigo-500">
              Recommendation Match
            </span>

            <span className="text-[8px] font-black text-indigo-700 dark:text-indigo-300">
              {Math.min(event.score, 100)}%
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{
                width: `${Math.min(event.score, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Reasons */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {event.categoryMatch && (
            <ReasonBadge label="Interest match" />
          )}

          {event.locationMatch && (
            <ReasonBadge label="Near you" />
          )}

          {event.matchingSkills
            .slice(0, 2)
            .map((skill) => (
              <ReasonBadge
                key={skill}
                label={`Skill: ${skill}`}
              />
            ))}

          {event.bookmarked && (
            <ReasonBadge label="Bookmarked" />
          )}
        </div>

        {/* Meta */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CalendarClock size={10} />

              <span className="text-[6px] font-bold">
                Event Date
              </span>
            </div>

            <p className="mt-1 text-[7px] font-bold text-slate-700 dark:text-slate-300">
              {event.date}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <TrendingUp size={10} />

              <span className="text-[6px] font-bold">
                Participants
              </span>
            </div>

            <p className="mt-1 text-[7px] font-bold text-slate-700 dark:text-slate-300">
              {event.participants}
            </p>
          </div>
        </div>

        {/* Deadline */}
        <div
          className={`mt-4 rounded-xl px-3 py-2.5 ${
            event.daysToDeadline >= 0 &&
            event.daysToDeadline <= 3
              ? "bg-red-50 dark:bg-red-900/10"
              : "bg-slate-50 dark:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[6px] font-bold text-slate-400">
              Registration
            </span>

            <span
              className={`text-[7px] font-black ${
                event.daysToDeadline >= 0 &&
                event.daysToDeadline <= 3
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {deadlineLabel}
            </span>
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white transition hover:bg-indigo-700"
        >
          View Event

          <ChevronRight size={13} />
        </button>
      </div>
    </article>
  );
};

const ReasonBadge = ({ label }) => (
  <span className="rounded-full bg-slate-100 px-2 py-1 text-[5px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
    {label}
  </span>
);

export default EventParticipantPersonalizedEventFeed;