import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  Clock3,
  MapPin,
  Mic2,
  Navigation,
  PlayCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_SESSIONS = [
  {
    id: 1,
    title: "Opening Keynote",
    speaker: "Dr. Rahul Sharma",
    venue: "Main Auditorium",
    start: "10:00",
    end: "11:00",
  },
  {
    id: 2,
    title: "AI & Machine Learning Workshop",
    speaker: "Priya Mehta",
    venue: "Lab 1",
    start: "11:15",
    end: "12:15",
  },
  {
    id: 3,
    title: "Building Modern Web Apps",
    speaker: "Aarav Shah",
    venue: "Room 204",
    start: "12:30",
    end: "13:30",
  },
];

const LiveSessionNavigation = ({
  sessions = DEFAULT_SESSIONS,
  currentTime,
  onNavigate,
}) => {
  const [now, setNow] = useState(
    currentTime
      ? new Date(currentTime)
      : new Date()
  );

  useEffect(() => {
    if (currentTime) {
      setNow(new Date(currentTime));
      return undefined;
    }

    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTime]);

  const schedule = useMemo(() => {
    return sessions
      .map((session) => ({
        ...session,
        startDate: timeToDate(
          session.start,
          now
        ),
        endDate: timeToDate(
          session.end,
          now
        ),
      }))
      .sort(
        (a, b) =>
          a.startDate - b.startDate
      );
  }, [sessions, now]);

  const currentSession = schedule.find(
    (session) =>
      now >= session.startDate &&
      now < session.endDate
  );

  const nextSession = schedule.find(
    (session) =>
      session.startDate > now
  );

  const remainingSeconds = currentSession
    ? Math.max(
        0,
        Math.floor(
          (currentSession.endDate - now) /
            1000
        )
      )
    : 0;

  const progress = currentSession
    ? Math.min(
        100,
        Math.max(
          0,
          ((now -
            currentSession.startDate) /
            (currentSession.endDate -
              currentSession.startDate)) *
            100
        )
      )
    : 0;

  const handleNavigation = (session) => {
    if (!session) return;

    if (onNavigate) {
      onNavigate(session);
      return;
    }

    const query = encodeURIComponent(
      `${session.venue}, event venue`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
            <Navigation size={21} />
          </div>

          <div>
            <p className="text-[8px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Event Mode
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Session Navigation
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              See what's happening now and where you need to go next.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />

          <span className="text-[7px] font-bold text-slate-600 dark:text-slate-300">
            LIVE
          </span>

          <span className="text-[7px] text-slate-400">
            {formatCurrentTime(now)}
          </span>
        </div>
      </div>

      {/* Current Session */}
      {currentSession ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-indigo-200 bg-white dark:border-indigo-900/40 dark:bg-slate-900">
          <div className="bg-indigo-600 p-5 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
                  <PlayCircle size={11} />

                  <span className="text-[6px] font-bold uppercase tracking-wider">
                    Happening Now
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {currentSession.title}
                </h3>

                <div className="mt-2 flex items-center gap-2 text-[7px] text-indigo-100">
                  <Mic2 size={11} />
                  {currentSession.speaker}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 text-center">
                <p className="text-[6px] font-bold uppercase tracking-wide text-indigo-200">
                  Time Remaining
                </p>

                <p className="mt-1 text-2xl font-black">
                  {formatDuration(
                    remainingSeconds
                  )}
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex justify-between text-[6px] font-semibold text-indigo-200">
                <span>
                  {formatTime(
                    currentSession.start
                  )}
                </span>

                <span>
                  {formatTime(
                    currentSession.end
                  )}
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <InfoItem
              icon={MapPin}
              label="Venue / Room"
              value={currentSession.venue}
            />

            <InfoItem
              icon={Clock3}
              label="Session Time"
              value={`${formatTime(
                currentSession.start
              )} – ${formatTime(
                currentSession.end
              )}`}
            />
          </div>
        </div>
      ) : (
        <EmptyCurrentSession
          nextSession={nextSession}
          onNavigate={handleNavigation}
        />
      )}

      {/* Next Session */}
      {nextSession && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[6px] font-bold uppercase text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  Next Session
                </span>

                <span className="text-[6px] font-semibold text-slate-400">
                  Starts in{" "}
                  {formatCountdown(
                    Math.max(
                      0,
                      Math.floor(
                        (nextSession.startDate -
                          now) /
                          1000
                      )
                    )
                  )}
                </span>
              </div>

              <h3 className="mt-3 text-sm font-black text-slate-800 dark:text-white">
                {nextSession.title}
              </h3>

              <div className="mt-2 flex flex-wrap gap-3">
                <span className="flex items-center gap-1.5 text-[7px] text-slate-500 dark:text-slate-400">
                  <Mic2 size={11} />
                  {nextSession.speaker}
                </span>

                <span className="flex items-center gap-1.5 text-[7px] text-slate-500 dark:text-slate-400">
                  <MapPin size={11} />
                  {nextSession.venue}
                </span>

                <span className="flex items-center gap-1.5 text-[7px] text-slate-500 dark:text-slate-400">
                  <Clock3 size={11} />
                  {formatTime(
                    nextSession.start
                  )}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleNavigation(
                  nextSession
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-indigo-700"
            >
              <Navigation size={12} />
              Navigate
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Schedule */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[9px] font-bold text-slate-800 dark:text-white">
              Today's Sessions
            </h3>

            <p className="mt-1 text-[7px] text-slate-400">
              Quickly find your current and upcoming sessions.
            </p>
          </div>

          <CalendarClock
            size={16}
            className="text-slate-400"
          />
        </div>

        <div className="mt-5 space-y-2">
          {schedule.map((session) => {
            const isCurrent =
              currentSession?.id ===
              session.id;

            const isPast =
              session.endDate <= now;

            return (
              <SessionRow
                key={session.id}
                session={session}
                isCurrent={isCurrent}
                isPast={isPast}
                onNavigate={() =>
                  handleNavigation(
                    session
                  )
                }
              />
            );
          })}
        </div>
      </div>

      {/* Navigation Help */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
        <Navigation
          size={16}
          className="mt-0.5 shrink-0 text-blue-500"
        />

        <div>
          <p className="text-[8px] font-bold text-blue-700 dark:text-blue-400">
            Never miss your next session
          </p>

          <p className="mt-1 text-[7px] leading-4 text-blue-700/70 dark:text-blue-400/70">
            Use the Navigate button to open directions to the
            next session venue. The live timer automatically
            updates as sessions progress.
          </p>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------
   Info Item
--------------------------------- */

const InfoItem = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-indigo-600 dark:bg-slate-900 dark:text-indigo-400">
        <Icon size={13} />
      </div>

      <div className="min-w-0">
        <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-[8px] font-bold text-slate-700 dark:text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
};

/* --------------------------------
   Session Row
--------------------------------- */

const SessionRow = ({
  session,
  isCurrent,
  isPast,
  onNavigate,
}) => {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border p-3 transition sm:flex-row sm:items-center ${
        isCurrent
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/40 dark:bg-indigo-900/10"
          : isPast
          ? "border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-950"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
      }`}
    >
      <div className="flex w-16 shrink-0 items-center gap-2 sm:block">
        <p className="text-[7px] font-black text-slate-700 dark:text-slate-300">
          {formatTime(session.start)}
        </p>

        <span className="text-[6px] text-slate-400 sm:block">
          {formatTime(session.end)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isCurrent && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          )}

          <h4 className="truncate text-[8px] font-bold text-slate-800 dark:text-white">
            {session.title}
          </h4>
        </div>

        <div className="mt-1 flex flex-wrap gap-3">
          <span className="flex items-center gap-1 text-[6px] text-slate-400">
            <Mic2 size={9} />
            {session.speaker}
          </span>

          <span className="flex items-center gap-1 text-[6px] text-slate-400">
            <MapPin size={9} />
            {session.venue}
          </span>
        </div>
      </div>

      {!isPast && (
        <button
          type="button"
          onClick={onNavigate}
          className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-[6px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
        >
          <Navigation size={10} />
          Navigate
          <ChevronRight size={10} />
        </button>
      )}
    </div>
  );
};

/* --------------------------------
   Empty Current Session
--------------------------------- */

const EmptyCurrentSession = ({
  nextSession,
  onNavigate,
}) => {
  return (
    <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <Clock3
        size={28}
        className="mx-auto text-slate-300 dark:text-slate-600"
      />

      <h3 className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
        No session is currently running
      </h3>

      <p className="mt-1 text-[7px] text-slate-400">
        {nextSession
          ? `Your next session starts at ${formatTime(
              nextSession.start
            )}.`
          : "There are no upcoming sessions."}
      </p>

      {nextSession && (
        <button
          type="button"
          onClick={() =>
            onNavigate(nextSession)
          }
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[7px] font-bold text-white hover:bg-indigo-700"
        >
          <Navigation size={12} />
          Navigate to Next Session
        </button>
      )}
    </div>
  );
};

/* --------------------------------
   Helpers
--------------------------------- */

const timeToDate = (time, referenceDate) => {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const date = new Date(referenceDate);

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date;
};

const formatTime = (time) => {
  if (!time) return "--";

  const [hours, minutes] = time
    .split(":")
    .map(Number);

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatCurrentTime = (date) => {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDuration = (seconds) => {
  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const formatCountdown = (seconds) => {
  if (seconds <= 0) {
    return "now";
  }

  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

export default LiveSessionNavigation;