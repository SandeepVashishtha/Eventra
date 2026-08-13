import {
  CalendarCheck,
  ChevronRight,
  Flame,
  Medal,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo } from "react";

const DEFAULT_EVENTS = [
  {
    id: 1,
    title: "AI & Machine Learning Workshop",
    date: "2026-08-10",
    attended: true,
  },
  {
    id: 2,
    title: "Web Development Hackathon",
    date: "2026-08-08",
    attended: true,
  },
  {
    id: 3,
    title: "Data Science Meetup",
    date: "2026-08-05",
    attended: true,
  },
  {
    id: 4,
    title: "Open Source Contribution Day",
    date: "2026-08-02",
    attended: true,
  },
  {
    id: 5,
    title: "Cloud Computing Seminar",
    date: "2026-07-28",
    attended: true,
  },
  {
    id: 6,
    title: "Cybersecurity Workshop",
    date: "2026-07-20",
    attended: false,
  },
];

const MILESTONES = [
  {
    count: 3,
    title: "Getting Started",
    description: "Attend 3 events",
  },
  {
    count: 5,
    title: "Active Participant",
    description: "Attend 5 events",
  },
  {
    count: 10,
    title: "Event Explorer",
    description: "Attend 10 events",
  },
  {
    count: 25,
    title: "Community Champion",
    description: "Attend 25 events",
  },
  {
    count: 50,
    title: "Event Legend",
    description: "Attend 50 events",
  },
];

const EventParticipationStreak = ({
  events = DEFAULT_EVENTS,
  currentStreak: providedCurrentStreak,
  longestStreak: providedLongestStreak,
  onEventClick,
  className = "",
}) => {
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      ),
    [events]
  );

  const attendedEvents = useMemo(
    () =>
      sortedEvents.filter(
        (event) => event.attended
      ),
    [sortedEvents]
  );

  const calculatedStreaks = useMemo(
    () =>
      calculateStreaks(
        attendedEvents
      ),
    [attendedEvents]
  );

  const currentStreak =
    providedCurrentStreak ??
    calculatedStreaks.current;

  const longestStreak =
    providedLongestStreak ??
    calculatedStreaks.longest;

  const nextMilestone =
    MILESTONES.find(
      (milestone) =>
        milestone.count >
        attendedEvents.length
    ) || null;

  const achievedMilestones =
    MILESTONES.filter(
      (milestone) =>
        attendedEvents.length >=
        milestone.count
    );

  const milestoneProgress =
    nextMilestone
      ? Math.min(
          Math.round(
            (attendedEvents.length /
              nextMilestone.count) *
              100
          ),
          100
        )
      : 100;

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Flame
              size={22}
              className="text-orange-500"
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              Participation
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Event Participation Streak
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
              Keep attending events to maintain your streak and
              unlock participation milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-[9px] font-bold text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
          <Flame size={11} />
          Keep it going!
        </div>
      </div>

      {/* Streak overview */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StreakCard
          icon={
            <Flame
              size={22}
              className="text-orange-500"
            />
          }
          label="Current Streak"
          value={currentStreak}
          suffix="events"
          description={
            currentStreak > 0
              ? "You're on a roll!"
              : "Attend an event to start"
          }
          highlighted
        />

        <StreakCard
          icon={
            <Trophy
              size={22}
              className="text-amber-500"
            />
          }
          label="Longest Streak"
          value={longestStreak}
          suffix="events"
          description="Your personal best"
        />
      </div>

      {/* Progress */}
      <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-900/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-orange-500">
              Next Milestone
            </p>

            <h3 className="mt-1 text-sm font-bold text-orange-800 dark:text-orange-200">
              {nextMilestone
                ? nextMilestone.title
                : "All Milestones Achieved"}
            </h3>

            <p className="mt-1 text-[9px] text-orange-600 dark:text-orange-400">
              {nextMilestone
                ? `${Math.max(
                    nextMilestone.count -
                      attendedEvents.length,
                    0
                  )} more event${
                    nextMilestone.count -
                      attendedEvents.length ===
                    1
                      ? ""
                      : "s"
                  } to go`
                : "Amazing participation!"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {attendedEvents.length}
              {nextMilestone
                ? `/${nextMilestone.count}`
                : ""}
            </p>

            <p className="text-[8px] font-semibold text-orange-500">
              events attended
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-900">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{
              width: `${milestoneProgress}%`,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[8px] font-semibold text-orange-500">
          <span>
            {milestoneProgress}% complete
          </span>

          {nextMilestone && (
            <span>
              Goal: {nextMilestone.count}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SmallStat
          icon={
            <CalendarCheck size={15} />
          }
          value={
            attendedEvents.length
          }
          label="Events Attended"
        />

        <SmallStat
          icon={<Users size={15} />}
          value={events.length}
          label="Total Events"
        />

        <SmallStat
          icon={<Medal size={15} />}
          value={
            achievedMilestones.length
          }
          label="Milestones"
        />
      </div>

      {/* Milestones */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Streak Milestones
            </h3>

            <p className="mt-1 text-[9px] text-slate-400">
              Reach participation goals to unlock milestones.
            </p>
          </div>

          <Medal
            size={17}
            className="text-slate-400"
          />
        </div>

        <div className="mt-4 space-y-3">
          {MILESTONES.map(
            (milestone) => {
              const achieved =
                attendedEvents.length >=
                milestone.count;

              const progress = Math.min(
                Math.round(
                  (attendedEvents.length /
                    milestone.count) *
                    100
                ),
                100
              );

              return (
                <MilestoneItem
                  key={
                    milestone.count
                  }
                  milestone={
                    milestone
                  }
                  achieved={
                    achieved
                  }
                  progress={
                    progress
                  }
                />
              );
            }
          )}
        </div>
      </div>

      {/* Events contributing to streak */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Events Contributing to Your Streak
            </h3>

            <p className="mt-1 text-[9px] text-slate-400">
              Your recent attended events.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {attendedEvents.length} attended
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {attendedEvents.length ===
          0 ? (
            <EmptyAttendanceState />
          ) : (
            attendedEvents
              .slice(0, 8)
              .map((event, index) => (
                <EventStreakItem
                  key={event.id}
                  event={event}
                  position={
                    index + 1
                  }
                  onClick={() =>
                    onEventClick?.(
                      event
                    )
                  }
                />
              ))
          )}
        </div>
      </div>
    </section>
  );
};

/* ----------------------------------
   Streak card
----------------------------------- */

const StreakCard = ({
  icon,
  label,
  value,
  suffix,
  description,
  highlighted = false,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlighted
          ? "border-orange-200 bg-white dark:border-orange-900/40 dark:bg-slate-900"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
          {icon}
        </div>

        {highlighted && (
          <span className="rounded-full bg-orange-50 px-2 py-1 text-[7px] font-bold uppercase text-orange-500 dark:bg-orange-900/20">
            Active
          </span>
        )}
      </div>

      <p className="mt-4 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900 dark:text-white">
          {value}
        </span>

        <span className="text-[10px] font-semibold text-slate-400">
          {suffix}
        </span>
      </div>

      <p className="mt-1 text-[9px] text-slate-400">
        {description}
      </p>
    </div>
  );
};

/* ----------------------------------
   Small stat
----------------------------------- */

const SmallStat = ({
  icon,
  value,
  label,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-indigo-500">
        {icon}

        <span className="text-lg font-bold text-slate-800 dark:text-white">
          {value}
        </span>
      </div>

      <p className="mt-1 text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
    </div>
  );
};

/* ----------------------------------
   Milestone item
----------------------------------- */

const MilestoneItem = ({
  milestone,
  achieved,
  progress,
}) => {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        achieved
          ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            achieved
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
          }`}
        >
          {achieved ? (
            <Trophy size={17} />
          ) : (
            <Medal size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4
                className={`text-[10px] font-bold ${
                  achieved
                    ? "text-green-700 dark:text-green-300"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {milestone.title}
              </h4>

              <p className="mt-0.5 text-[8px] text-slate-400">
                {milestone.description}
              </p>
            </div>

            <span
              className={`text-[9px] font-bold ${
                achieved
                  ? "text-green-600 dark:text-green-400"
                  : "text-slate-400"
              }`}
            >
              {achieved
                ? "Completed"
                : `${progress}%`}
            </span>
          </div>

          {!achieved && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Event item
----------------------------------- */

const EventStreakItem = ({
  event,
  position,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[9px] font-bold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
        #{position}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">
          {event.title}
        </h4>

        <div className="mt-1 flex items-center gap-1.5 text-[8px] text-slate-400">
          <CalendarCheck size={9} />

          {formatDate(event.date)}

          <span>•</span>

          <span className="font-semibold text-green-500">
            Attended
          </span>
        </div>
      </div>

      <ChevronRight
        size={14}
        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
      />
    </button>
  );
};

/* ----------------------------------
   Empty attendance state
----------------------------------- */

const EmptyAttendanceState =
  () => {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <CalendarCheck size={17} />
        </div>

        <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
          No attended events yet
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          Attend your first event to start your participation streak.
        </p>
      </div>
    );
  };

/* ----------------------------------
   Streak calculation
----------------------------------- */

const calculateStreaks = (
  attendedEvents
) => {
  if (!attendedEvents.length) {
    return {
      current: 0,
      longest: 0,
    };
  }

  const uniqueDates = [
    ...new Set(
      attendedEvents.map(
        (event) =>
          normalizeDate(event.date)
      )
    ),
  ].sort(
    (a, b) =>
      new Date(b) -
      new Date(a)
  );

  let longest = 1;
  let running = 1;

  for (
    let index = 1;
    index < uniqueDates.length;
    index += 1
  ) {
    const difference =
      dayDifference(
        uniqueDates[index - 1],
        uniqueDates[index]
      );

    if (difference <= 7) {
      running += 1;
      longest = Math.max(
        longest,
        running
      );
    } else {
      running = 1;
    }
  }

  let current = 1;

  for (
    let index = 1;
    index < uniqueDates.length;
    index += 1
  ) {
    const difference =
      dayDifference(
        uniqueDates[index - 1],
        uniqueDates[index]
      );

    if (difference <= 7) {
      current += 1;
    } else {
      break;
    }
  }

  return {
    current,
    longest,
  };
};

/* ----------------------------------
   Date helpers
----------------------------------- */

const normalizeDate = (
  date
) => {
  const parsed = new Date(date);

  return new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
};

const dayDifference = (
  first,
  second
) => {
  const firstDate =
    normalizeDate(first);

  const secondDate =
    normalizeDate(second);

  return Math.round(
    Math.abs(
      firstDate -
        secondDate
    ) /
      (1000 *
        60 *
        60 *
        24)
  );
};

const formatDate = (
  date
) => {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(new Date(date));
};

export default EventParticipationStreak;